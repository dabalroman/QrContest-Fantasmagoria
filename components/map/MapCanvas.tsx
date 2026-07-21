import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import debounce from 'lodash.debounce';
import Pin, { PinCoords } from '@/models/Pin';
import { fromLatLng, getMap, imageBounds, toLatLng } from '@/utils/maps';
import { getStoredView, saveView } from '@/utils/mapView';
import PinMarkerIcon from '@/components/map/PinMarkerIcon';

// The ONLY file that value-imports leaflet (it touches `window` at module scope), so pages/map.tsx
// must load it via next/dynamic with ssr:false.
//
// `onMapClick`/`draft` are additive, admin-only props (#14's map-native pin editor) — both default to
// undefined/null so the player call site (pages/map.tsx) is unchanged. `collectedUids` doubles as a
// generic "dim + suppress hint circle" set: the admin editor passes INACTIVE pin uids through it
// instead of adding a new prop.
// Only ever a temporary floor while measuring the overview zoom — low enough that no map canvas
// can fit at it, so it never clamps the measurement.
const UNCLAMPED_MIN_ZOOM = -10;

// In CRS.Simple zoom 0 is one image pixel per CSS pixel, so this caps zoom-in at the art's native
// resolution — past it you are magnifying pixels, not revealing detail.
const NATIVE_ZOOM = 0;

export default function MapCanvas ({
    pins,
    activeMapId,
    collectedUids,
    onPinClick,
    onMapClick,
    draft = null
}: {
    pins: Pin[],
    activeMapId: string,
    collectedUids: Set<string>,
    onPinClick: (pin: Pin) => void,
    onMapClick?: (coords: PinCoords) => void,
    draft?: { coords: PinCoords, hintRadius: number | null } | null
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const overlayRef = useRef<L.ImageOverlay | null>(null);
    const layerGroupRef = useRef<L.LayerGroup | null>(null);
    const draftLayerGroupRef = useRef<L.LayerGroup | null>(null);

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
            // Default zoom control sits top-left, under the floating floor selector — move it bottom-left.
            zoomControl: false
        });
        L.control.zoom({ position: 'bottomleft' }).addTo(map);
        mapRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
        draftLayerGroupRef.current = L.layerGroup().addTo(map);

        // Persist the settled view for the current floor. Programmatic setView/fitBounds (floor swap,
        // first fit) also fire these — that just re-persists the same view, which is harmless.
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

        if (!overlayRef.current) {
            overlayRef.current = L.imageOverlay(mapDef.image, bounds).addTo(map);
        } else {
            overlayRef.current.setUrl(mapDef.image);
            overlayRef.current.setBounds(bounds);
        }

        map.setMaxBounds(bounds.pad(0.05));
        // getBoundsZoom clamps its result to the CURRENT minZoom (0 by default), so asking it for the
        // overview of an image wider than the viewport returns 0 and pins minZoom there permanently.
        // Drop the limit before measuring.
        map.setMinZoom(UNCLAMPED_MIN_ZOOM);
        // minZoom = the overview (whole image visible), recomputed per floor and set BEFORE any restore so
        // a stored zoom can never sit below the overview. A stored center/zoom outside the current art is
        // clamped by minZoom + maxBounds.
        const fitZoom = map.getBoundsZoom(bounds);
        map.setMinZoom(fitZoom);
        // Never below the overview: art smaller than the viewport fits at a zoom above native.
        map.setMaxZoom(Math.max(fitZoom, NATIVE_ZOOM));

        const stored = getStoredView(activeMapId);
        if (stored) {
            map.setView(stored.center, stored.zoom, { animate: false });
        } else {
            map.fitBounds(bounds);
        }
    }, [activeMapId]);

    // Rebuild markers + hint circles for the active floor.
    useEffect(() => {
        const map = mapRef.current;
        const layerGroup = layerGroupRef.current;
        if (!map || !layerGroup) {
            return;
        }

        layerGroup.clearLayers();

        pins
            .filter((pin) => pin.mapId === activeMapId)
            .forEach((pin) => {
                const collected = collectedUids.has(pin.uid);

                if (pin.hintRadius !== null && !collected) {
                    L.circle(toLatLng(pin.coords), {
                        radius: pin.hintRadius,
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
                    })
                })
                    .on('click', () => onPinClickRef.current(pin))
                    .addTo(layerGroup);
            });
    }, [activeMapId, pins, collectedUids]);

    // Admin-only draft marker for the not-yet-saved pin (#14). Always assumed to be on the currently
    // active floor — it only ever exists right after a tap on THIS canvas. The live hint-radius circle
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
