import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import debounce from 'lodash.debounce';
import Pin, { PinCoords } from '@/models/Pin';
import { fromLatLng, getMap, hintRadiusToPixels, imageBounds, mapImageUrl, toLatLng } from '@/utils/maps';
import { getStoredView, saveView } from '@/utils/mapView';
import { getMapQuality } from '@/utils/mapQuality';
import { MapQuality } from '@/Enum/MapQuality';
import PinMarkerIcon from '@/components/map/PinMarkerIcon';

// The ONLY file that value-imports leaflet (it touches `window` at module scope), so pages/map.tsx
// must load it via next/dynamic with ssr:false.
//
// `onMapClick`/`draft`/`placing` are additive, admin-only props (#14's map-native pin editor) - all
// default to undefined/null/false so the player call site (pages/map.tsx) is unchanged. `collectedUids`
// doubles as a generic "dim + suppress hint circle" set: the admin editor passes INACTIVE pin uids
// through it instead of adding a new prop.
// Only ever a temporary floor while measuring the overview zoom - low enough that no map canvas
// can fit at it, so it never clamps the measurement.
const UNCLAMPED_MIN_ZOOM = -10;

// In CRS.Simple zoom 0 is one image pixel per CSS pixel, so this caps zoom-in at the art's native
// resolution - past it you are magnifying pixels, not revealing detail.
const NATIVE_ZOOM = 0;

// Zoom-in headroom past native, in zoom levels. The art is smooth painted work that survives a 2x
// upscale, and the floors are dense enough that stopping dead at native leaves them hard to read.
const MAX_OVERZOOM = 1;

// How far below the contain-fit the overview may go, so the art is not pinned flush to the viewport
// edges. Must stay a multiple of zoomSnap or the floor lands off the snap grid.
const OVERVIEW_ZOOM_SLACK = 0.5;

// Breathing room around the overview, in CSS pixels. Deliberately small and symmetric: the art is
// edge-to-edge, so whatever is reserved here comes straight off the readable size of the map - which
// is why the floating MapAreaToggle is NOT accounted for, and overlaps the map's top edge at overview.
const EDGE_PADDING = 16;

// Pan slack past the image, as a fraction of the map's own size. It is in MAP units, so the CSS pixels
// it buys shrink as you zoom out - thinnest at the overview, which is exactly where the edge feels hard.
const PAN_SLACK = 0.2;

export default function MapCanvas ({
    pins,
    activeMapId,
    collectedUids,
    onPinClick,
    onMapClick,
    draft = null,
    placing = false
}: {
    pins: Pin[],
    activeMapId: string,
    collectedUids: Set<string>,
    onPinClick: (pin: Pin) => void,
    onMapClick?: (coords: PinCoords) => void,
    draft?: { coords: PinCoords, hintRadius: number | null } | null,
    placing?: boolean
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const overlayRef = useRef<L.ImageOverlay | null>(null);
    const layerGroupRef = useRef<L.LayerGroup | null>(null);
    const draftLayerGroupRef = useRef<L.LayerGroup | null>(null);

    // #56 quality, read once at mount. /map remounts on navigation, so flipping the toggle on Profil and
    // tapping to the map is enough - deliberately no live cross-page reactivity.
    const [quality] = useState(() => getMapQuality());

    // The URL last intentionally handed to the overlay - the 404-fallback handler compares against this
    // (not the DOM src) so a low-res miss retries full-res exactly once and a second failure is a no-op.
    const requestedUrlRef = useRef<string | null>(null);

    // Latest click handler, read by ref so re-rendering doesn't rebuild every marker's listener.
    const onPinClickRef = useRef(onPinClick);
    onPinClickRef.current = onPinClick;

    // Same ref pattern for the (optional) map-tap handler.
    const onMapClickRef = useRef(onMapClick);
    onMapClickRef.current = onMapClick;

    // Latest floor, read by ref so the once-bound moveend/zoomend listener persists to the right map.
    const activeMapIdRef = useRef(activeMapId);
    activeMapIdRef.current = activeMapId;

    // Coalesce a rapid pan→zoom→pan flurry into one localStorage write. moveend/zoomend are already
    // terminal (one per settled gesture), so this only merges back-to-back gestures.
    const persistView = useMemo(
        () => debounce((mapId: string, view: { center: [number, number], zoom: number }) => {
            saveView(mapId, view);
        }, 250),
        []
    );

    // Init + teardown, once. preferCanvas stays false: hintRadius circles are styled by CSS class,
    // which only exists on SVG paths.
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const map = L.map(containerRef.current, {
            crs: L.CRS.Simple,
            attributionControl: false,
            maxBoundsViscosity: 1,
            zoomSnap: 0.25,
            preferCanvas: false,
            // Default zoom control sits top-left, under the floating floor selector - move it bottom-left.
            zoomControl: false
        });
        L.control.zoom({ position: 'bottomleft' }).addTo(map);
        mapRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
        draftLayerGroupRef.current = L.layerGroup().addTo(map);

        // Persist the settled view for the current floor. Programmatic setView/fitBounds (floor swap,
        // first fit) also fire these - that just re-persists the same view, which is harmless.
        map.on('moveend zoomend', () => {
            const m = mapRef.current;
            if (!m) {
                return;
            }
            const center = m.getCenter();
            persistView(activeMapIdRef.current, { center: [center.lat, center.lng], zoom: m.getZoom() });
        });

        // Admin-only (undefined for the player map): tap-to-place-a-pin.
        map.on('click', (event: L.LeafletMouseEvent) => {
            onMapClickRef.current?.(fromLatLng(event.latlng));
        });

        return () => {
            persistView.flush();  // don't lose a pan made right before navigating away
            map.remove();
            mapRef.current = null;
            overlayRef.current = null;
            layerGroupRef.current = null;
            draftLayerGroupRef.current = null;
        };
    }, [persistView]);

    // Swap the floor image without recreating the map, and restore that floor's own saved view (or the
    // whole-image overview if it has none). Per-floor, so switching floors shows each one where it was left.
    useEffect(() => {
        const map = mapRef.current;
        const mapDef = getMap(activeMapId);
        if (!map || !mapDef) {
            return;
        }

        const bounds = L.latLngBounds(imageBounds(mapDef));
        const url = mapImageUrl(mapDef, quality);
        requestedUrlRef.current = url;

        if (!overlayRef.current) {
            const overlay = L.imageOverlay(url, bounds).addTo(map);
            // Fall back to full-res if a low/ file 404s: an incomplete low/ directory would otherwise
            // blank the app's main screen mid-event. Retry once (guarded by requestedUrlRef), never loop.
            overlay.on('error', () => {
                const activeDef = getMap(activeMapIdRef.current);
                if (!activeDef) {
                    return;
                }
                const fullResUrl = mapImageUrl(activeDef, MapQuality.HIGH);
                if (requestedUrlRef.current !== fullResUrl) {
                    requestedUrlRef.current = fullResUrl;
                    overlay.setUrl(fullResUrl);
                }
            });
            overlayRef.current = overlay;
        } else {
            overlayRef.current.setUrl(url);
            overlayRef.current.setBounds(bounds);
        }

        map.setMaxBounds(bounds.pad(PAN_SLACK));
        // getBoundsZoom clamps its result to the CURRENT minZoom (0 by default), so asking it for the
        // overview of an image wider than the viewport returns 0 and pins minZoom there permanently.
        // Drop the limit before measuring.
        map.setMinZoom(UNCLAMPED_MIN_ZOOM);
        // The contain-fit for THIS floor. Recomputed per floor and set BEFORE any restore, so a stored
        // view is clamped to the current art.
        const fitZoom = map.getBoundsZoom(bounds, false, L.point(EDGE_PADDING * 2, EDGE_PADDING * 2));
        map.setMinZoom(fitZoom - OVERVIEW_ZOOM_SLACK);
        // Never below the overview: art smaller than the viewport fits at a zoom above native.
        map.setMaxZoom(Math.max(fitZoom, NATIVE_ZOOM + MAX_OVERZOOM));

        const stored = getStoredView(activeMapId);
        if (stored) {
            map.setView(stored.center, stored.zoom, { animate: false });
        } else {
            map.fitBounds(bounds, { padding: [EDGE_PADDING, EDGE_PADDING] });
        }
    }, [activeMapId, quality]);

    // Rebuild markers + hint circles for the active floor.
    useEffect(() => {
        const map = mapRef.current;
        const layerGroup = layerGroupRef.current;
        const mapDefinition = getMap(activeMapId);
        if (!map || !layerGroup || !mapDefinition) {
            return;
        }

        layerGroup.clearLayers();

        pins
            .filter((pin) => pin.mapId === activeMapId)
            .forEach((pin) => {
                const collected = collectedUids.has(pin.uid);

                if (pin.hintRadius !== null && !collected) {
                    L.circle(toLatLng(pin.coords), {
                        radius: hintRadiusToPixels(mapDefinition, pin.hintRadius),
                        interactive: false,
                        className: `pin-hint-circle pin-hint-circle--${pin.type}`
                    }).addTo(layerGroup);
                }

                const html = renderToStaticMarkup(
                    <PinMarkerIcon type={pin.type} collected={collected}/>
                );

                L.marker(toLatLng(pin.coords), {
                    icon: L.divIcon({
                        html,
                        className: 'pin-marker',
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    }),
                    // While placing, a tap landing on a marker must reach the map underneath. Leaflet's
                    // own CSS keeps .leaflet-marker-icon pointer-events:none until `interactive` adds
                    // .leaflet-interactive, so dropping the flag is enough - no z-index or hit-test work.
                    interactive: !placing,
                    // Leaflet stacks markers by latitude, so reordering this loop would not help; the
                    // offset is what keeps a collected pin from covering one still to find.
                    zIndexOffset: collected ? -1000 : 0
                })
                    .on('click', () => onPinClickRef.current(pin))
                    .addTo(layerGroup);
            });
    }, [activeMapId, pins, collectedUids, placing]);

    // Admin-only draft marker for the not-yet-saved pin (#14). Always assumed to be on the currently
    // active floor - it only ever exists right after a tap on THIS canvas. The live hint-radius circle
    // preview is CUTTABLE and not built; the draft is a plain marker.
    useEffect(() => {
        const layerGroup = draftLayerGroupRef.current;
        if (!layerGroup) {
            return;
        }

        layerGroup.clearLayers();

        if (!draft) {
            return;
        }

        L.marker(toLatLng(draft.coords), {
            icon: L.divIcon({
                html: '<div class="pin-marker-draft"></div>',
                className: 'pin-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            }),
            interactive: false
        }).addTo(layerGroup);
    }, [draft, activeMapId]);

    // Grid/dvh can measure the container late (iOS); keep Leaflet's size in sync.
    useEffect(() => {
        if (!containerRef.current || typeof ResizeObserver === 'undefined') {
            return;
        }

        const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    return <div ref={containerRef} className="absolute inset-0 z-0"/>;
}
