// Per-device map render quality (#56). localStorage only - a per-device setting describes the hardware,
// not the person, and needs no callable (all client writes are denied). Mirrors utils/mapView.ts:
// every access is guarded and best-effort, never fatal. Default is HIGH for everyone; no device sniffing.

import { isMapQuality, MapQuality } from '@/Enum/MapQuality';

const STORAGE_KEY = 'map-quality';

export function getMapQuality (): MapQuality {
    if (typeof window === 'undefined') {
        return MapQuality.HIGH;
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw && isMapQuality(raw) ? raw : MapQuality.HIGH;
    } catch {
        return MapQuality.HIGH;
    }
}

export function setMapQuality (quality: MapQuality): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(STORAGE_KEY, quality);
    } catch {
        // Quota / private-mode / disabled storage - persistence is best-effort, never fatal.
    }
}
