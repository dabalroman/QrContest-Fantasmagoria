import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Pin from '@/models/Pin';
import { getMap, imageBounds, toLatLng } from '@/utils/maps';
import PinMarkerIcon from '@/components/map/PinMarkerIcon';

// The ONLY file that value-imports leaflet (it touches `window` at module scope), so pages/map.tsx
// must load it via next/dynamic with ssr:false.
export default function MapCanvas ({
    pins,
    activeMapId,
    collectedUids,
    onPinClick
}: {
    pins: Pin[],
    activeMapId: string,
    collectedUids: Set<string>,
    onPinClick: (pin: Pin) => void
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const overlayRef = useRef<L.ImageOverlay | null>(null);
    const layerGroupRef = useRef<L.LayerGroup | null>(null);

    // Latest click handler, read by ref so re-rendering doesn't rebuild every marker's listener.
    const onPinClickRef = useRef(onPinClick);
    onPinClickRef.current = onPinClick;

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
            preferCanvas: false
        });
        mapRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);

        return () => {
            map.remove();
            mapRef.current = null;
            overlayRef.current = null;
            layerGroupRef.current = null;
        };
    }, []);

    // Swap the floor image without recreating the map, so pan/zoom survives a floor change.
    useEffect(() => {
        const map = mapRef.current;
        const mapDef = getMap(activeMapId);
        if (!map || !mapDef) {
            return;
        }

        const bounds = L.latLngBounds(imageBounds(mapDef));

        if (!overlayRef.current) {
            overlayRef.current = L.imageOverlay(mapDef.image, bounds).addTo(map);
            // Fit only on first mount: "zoomed out" = whole image visible regardless of art size/device.
            map.fitBounds(bounds);
            map.setMinZoom(map.getZoom());
        } else {
            overlayRef.current.setUrl(mapDef.image);
            overlayRef.current.setBounds(bounds);
        }

        map.setMaxBounds(bounds.pad(0.05));
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
