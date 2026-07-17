// Per-device persistence of the map's active floor + per-floor pan/zoom (task #29). localStorage only —
// no callable, no Firestore (all client writes are denied; a per-gesture server write for cosmetic UI
// state is not worth the op budget). Mirrors the direct-localStorage idiom in components/Panel.tsx.

const STORAGE_KEY = 'map-view';

// center is a Leaflet CRS.Simple LatLng pair ([lat, lng] = map.getCenter()); zoom is map.getZoom().
export interface StoredView {
    center: [number, number];
    zoom: number;
}

interface MapViewStore {
    lastMapId: string;
    views: { [mapId: string]: StoredView };
}

function read (): MapViewStore | null {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as MapViewStore;
    } catch {
        return null;
    }
}

function write (store: MapViewStore): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
        // Quota / private-mode / disabled storage — persistence is best-effort, never fatal.
    }
}

function emptyStore (): MapViewStore {
    return { lastMapId: '', views: {} };
}

export function getStoredLastMapId (): string | null {
    return read()?.lastMapId || null;
}

export function getStoredView (mapId: string): StoredView | null {
    return read()?.views[mapId] ?? null;
}

export function saveLastMapId (mapId: string): void {
    const store = read() ?? emptyStore();
    store.lastMapId = mapId;
    write(store);
}

export function saveView (mapId: string, view: StoredView): void {
    const store = read() ?? emptyStore();
    store.lastMapId = mapId;
    store.views[mapId] = view;
    write(store);
}
