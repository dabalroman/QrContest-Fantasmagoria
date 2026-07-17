import { PinCoords } from '@/models/Pin';
import { LatLngTuple } from 'leaflet';

// The canonical map registry (decision 29 + 30). NINE maps, not six: Dwór is a standalone city map
// belonging to no building; MOK has 5 levels (incl. Piętro 1.5); 2LO has 3. #13 owns these mapIds and
// the seed points at them. #16 swaps the real art in by overwriting public/maps/<mapId>.webp — no code
// change. Placeholder dimensions must contain every seed coord; freeze one canvas size per building
// when the real art lands or every coord points at the wrong room.

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

const placeholder = (mapId: string): Pick<MapDefinition, 'image' | 'width' | 'height'> => ({
    image: `/maps/${mapId}.webp`,
    width: PLACEHOLDER_WIDTH,
    height: PLACEHOLDER_HEIGHT
});

// Declaration order within a building = floor-strip order (top to bottom in the strip).
export const maps: MapDefinition[] = [
    { mapId: 'dwor', area: MapArea.DWOR, floorLabel: null, ...placeholder('dwor') },

    { mapId: 'mok-piwnica', area: MapArea.MOK, floorLabel: 'Piwnica', ...placeholder('mok-piwnica') },
    { mapId: 'mok-parter', area: MapArea.MOK, floorLabel: 'Parter', ...placeholder('mok-parter') },
    { mapId: 'mok-pietro-1', area: MapArea.MOK, floorLabel: 'Piętro 1', ...placeholder('mok-pietro-1') },
    { mapId: 'mok-pietro-1-5', area: MapArea.MOK, floorLabel: 'Piętro 1.5', ...placeholder('mok-pietro-1-5') },
    { mapId: 'mok-pietro-2', area: MapArea.MOK, floorLabel: 'Piętro 2', ...placeholder('mok-pietro-2') },

    { mapId: '2lo-parter', area: MapArea.LO, floorLabel: 'Parter', ...placeholder('2lo-parter') },
    { mapId: '2lo-pietro-1', area: MapArea.LO, floorLabel: 'Piętro 1', ...placeholder('2lo-pietro-1') },
    { mapId: '2lo-pietro-2', area: MapArea.LO, floorLabel: 'Piętro 2', ...placeholder('2lo-pietro-2') }
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

// Image extent in CRS.Simple space: top-left (-height,0) → bottom-right (0,width).
export function imageBounds (map: MapDefinition): LatLngTuple[] {
    return [[-map.height, 0], [0, map.width]];
}
