import { PinCoords } from '@/models/Pin';
import { LatLngTuple } from 'leaflet';
import { MapQuality } from '@/Enum/MapQuality';

// The canonical map registry (decision 29 + 30). NINE maps, not six: Miasto is a standalone city map
// belonging to no building; MOK has 5 levels (incl. Piętro 1.5); 2LO has 3. #13 owns these mapIds and
// the seed points at them. Swapping art in is overwriting public/maps/<mapId>.webp - but then also
// re-run scripts/generate-low-maps.sh (#56): the "Niska" quality toggle serves public/maps/low/, and
// overwriting the full-res art without regenerating leaves every "Niska" player on the old edition's
// map with no error anywhere. The declared width/height must match the FULL-res file, and changing
// them after coords are authored points every pin at the wrong room.

export enum MapArea {
    DWOR = 'dwor',
    MOK = 'mok',
    LO = '2lo'
}

export const MAP_AREA_LABELS: Record<MapArea, string> = {
    [MapArea.DWOR]: 'Miasto',
    [MapArea.MOK]: 'MOK',
    [MapArea.LO]: '2LO'
};

// Peer-area order in the top toggle row.
export const MAP_AREAS: MapArea[] = [MapArea.DWOR, MapArea.MOK, MapArea.LO];

export interface MapDefinition {
    mapId: string;
    area: MapArea;
    // null = the area has no floors (Miasto) → no floor strip is rendered.
    floorLabel: string | null;
    image: string;
    width: number;
    height: number;
}

// Most floors are a square 2048 canvas; the two that carry gardens are not, so they pass their own
// dimensions. These must stay equal to the file's real pixel size - NATIVE_ZOOM in MapCanvas assumes
// one declared unit is one image pixel. Changing them after #16 authors coords moves every pin.
const ART_SIZE = 2048;

const art = (
    mapId: string,
    width: number = ART_SIZE,
    height: number = ART_SIZE
): Pick<MapDefinition, 'image' | 'width' | 'height'> => ({
    image: `/maps/${mapId}.webp`,
    width,
    height
});

// Declaration order within a building = floor-strip order (top to bottom in the strip).
export const maps: MapDefinition[] = [
    { mapId: 'dwor', area: MapArea.DWOR, floorLabel: null, ...art('dwor') },

    { mapId: 'mok-piwnica', area: MapArea.MOK, floorLabel: 'Piwnica', ...art('mok-piwnica') },
    { mapId: 'mok-parter', area: MapArea.MOK, floorLabel: 'Parter', ...art('mok-parter', 2048, 1024) },
    { mapId: 'mok-pietro-1', area: MapArea.MOK, floorLabel: 'Piętro 1', ...art('mok-pietro-1') },
    { mapId: 'mok-pietro-1-5', area: MapArea.MOK, floorLabel: 'Piętro 1.5', ...art('mok-pietro-1-5') },
    { mapId: 'mok-pietro-2', area: MapArea.MOK, floorLabel: 'Piętro 2', ...art('mok-pietro-2') },

    { mapId: '2lo-parter', area: MapArea.LO, floorLabel: 'Parter', ...art('2lo-parter', 1799, 2048) },
    { mapId: '2lo-pietro-1', area: MapArea.LO, floorLabel: 'Piętro 1', ...art('2lo-pietro-1') },
    { mapId: '2lo-pietro-2', area: MapArea.LO, floorLabel: 'Piętro 2', ...art('2lo-pietro-2') }
];

export const defaultMapId = 'dwor';

export function getMap (mapId: string): MapDefinition | undefined {
    return maps.find((map) => map.mapId === mapId);
}

// The single place that knows the directory layout for the #56 quality toggle. LOW serves the half-res
// copy from public/maps/low/; L.ImageOverlay stretches it to imageBounds(), which reads the registry's
// full-res width/height - so a low-res file lands every pin in the exact same place, just softer.
// Never "correct" width/height to a low-res file's size: that is the one edit that relocates every pin.
export function mapImageUrl (map: MapDefinition, quality: MapQuality): string {
    return quality === MapQuality.LOW ? `/maps/low/${map.mapId}.webp` : `/maps/${map.mapId}.webp`;
}

export function getMapsInArea (area: MapArea): MapDefinition[] {
    return maps.filter((map) => map.area === area);
}

// The sole `[-y, x]` swap into Leaflet CRS.Simple space. coords{x,y} are pixels from the image
// top-left with y growing down; CRS.Simple treats lat as +up, so y is negated. Never inline this.
export function toLatLng (coords: PinCoords): LatLngTuple {
    return [-coords.y, coords.x];
}

// The only reverse of toLatLng - #14's map-tap-to-place-a-pin coord picker. Rounded to whole pixels:
// coords are always authored/stored as integers (see PinCoords).
export function fromLatLng (latlng: { lat: number, lng: number }): PinCoords {
    return { x: Math.round(latlng.lng), y: Math.round(-latlng.lat) };
}

// hintRadius is authored in map-relative units, NOT pixels: 1 unit = 1% of the shorter side, so the
// same value covers the same share of the floor on every map and survives an art resolution swap
// (the one thing absolute coords can't - see the width/height warning at the top of this file).
// Shorter side, so a radius can never overshoot the map on one axis while fitting on the other.
const HINT_RADIUS_UNITS_PER_MAP = 100;

export function hintRadiusToPixels (map: MapDefinition, radius: number): number {
    return radius * Math.min(map.width, map.height) / HINT_RADIUS_UNITS_PER_MAP;
}

// Image extent in CRS.Simple space: top-left (-height,0) → bottom-right (0,width).
export function imageBounds (map: MapDefinition): LatLngTuple[] {
    return [[-map.height, 0], [0, map.width]];
}
