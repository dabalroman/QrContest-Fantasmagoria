export enum MapQuality {
    HIGH = 'high',
    LOW = 'low'
}

export function isMapQuality (quality: string): quality is MapQuality {
    return Object.values(MapQuality).includes(quality as MapQuality);
}
