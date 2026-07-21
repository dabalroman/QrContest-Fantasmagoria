import { PinCoords } from '@/models/Pin';
import { LatLngTuple } from 'leaflet';

// The canonical map registry (decision 29 + 30). NINE maps, not six: Dwór is a standalone city map
// belonging to no building; MOK has 5 levels (incl. Piętro 1.5); 2LO has 3. #13 owns these mapIds and
// the seed points at them. Real art has landed for MOK + 2LO; Dwór is still a placeholder. Swapping art
// in is overwriting public/maps/<mapId>.webp — no code change — but the declared width/height must match
// the file, and changing them after coords are authored points every pin at the wrong room.

export enum MapArea {
    DWOR = 'dwor',
    MOK = 'mok',
    LO = '2lo'
}

export const MAP_AREA_LABELS: Record<MapArea, string> = {
    [MapArea.DWOR]: 'Dwór',
    [MapArea.MOK]: 'MOK',
    [MapArea.LO]: '2LO'
};

// Peer-area order in the top toggle row.
export const MAP_AREAS: MapArea[] = [MapArea.DWOR, MapArea.MOK, MapArea.LO];

export interface MapDefinition {
    mapId: string;
    area: MapArea;
    // null = the area has no floors (Dwór) → no floor strip is rendered.
    floorLabel: string | null;
    image: string;
    width: number;
    height: number;
}

const PLACEHOLDER_WIDTH = 1000;
const PLACEHOLDER_HEIGHT = 800;

// The real art is a square 4096 canvas per floor. Changing this after #16 authors coords moves every pin.
const ART_SIZE = 4096;

const placeholder = (mapId: string): Pick<MapDefinition, 'image' | 'width' | 'height'> => ({
    image: `/maps/${mapId}.webp`,
    width: PLACEHOLDER_WIDTH,
    height: PLACEHOLDER_HEIGHT
});

const art = (mapId: string): Pick<MapDefinition, 'image' | 'width' | 'height'> => ({
    image: `/maps/${mapId}.webp`,
    width: ART_SIZE,
    height: ART_SIZE
});

// Declaration order within a building = floor-strip order (top to bottom in the strip).
export const maps: MapDefinition[] = [
    { mapId: 'dwor', area: MapArea.DWOR, floorLabel: null, ...placeholder('dwor') },

    { mapId: 'mok-piwnica', area: MapArea.MOK, floorLabel: 'Piwnica', ...art('mok-piwnica') },
    { mapId: 'mok-parter', area: MapArea.MOK, floorLabel: 'Parter', ...art('mok-parter') },
    { mapId: 'mok-pietro-1', area: MapArea.MOK, floorLabel: 'Piętro 1', ...art('mok-pietro-1') },
    { mapId: 'mok-pietro-1-5', area: MapArea.MOK, floorLabel: 'Piętro 1.5', ...art('mok-pietro-1-5') },
    { mapId: 'mok-pietro-2', area: MapArea.MOK, floorLabel: 'Piętro 2', ...art('mok-pietro-2') },

    { mapId: '2lo-parter', area: MapArea.LO, floorLabel: 'Parter', ...art('2lo-parter') },
    { mapId: '2lo-pietro-1', area: MapArea.LO, floorLabel: 'Piętro 1', ...art('2lo-pietro-1') },
    { mapId: '2lo-pietro-2', area: MapArea.LO, floorLabel: 'Piętro 2', ...art('2lo-pietro-2') }
];

export const defaultMapId = 'dwor';

export function getMap (mapId: string): MapDefinition | undefined {
    return maps.find((map) => map.mapId === mapId);
}

export function getMapsInArea (area: MapArea): MapDefinition[] {
    return maps.filter((map) => map.area === area);
}

// The sole `[-y, x]` swap into Leaflet CRS.Simple space. coords{x,y} are pixels from the image
// top-left with y growing down; CRS.Simple treats lat as +up, so y is negated. Never inline this.
export function toLatLng (coords: PinCoords): LatLngTuple {
    return [-coords.y, coords.x];
}

// The only reverse of toLatLng — #14's map-tap-to-place-a-pin coord picker. Rounded to whole pixels:
// coords are always authored/stored as integers (see PinCoords).
export function fromLatLng (latlng: { lat: number, lng: number }): PinCoords {
    return { x: Math.round(latlng.lng), y: Math.round(-latlng.lat) };
}

// Image extent in CRS.Simple space: top-left (-height,0) → bottom-right (0,width).
export function imageBounds (map: MapDefinition): LatLngTuple[] {
    return [[-map.height, 0], [0, map.width]];
}
