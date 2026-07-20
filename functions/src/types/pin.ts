import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export enum PinType {
    CODE = 'code',
    RIDDLE = 'riddle',
    VISIT = 'visit',
    FEEDBACK = 'feedback',
    PHOTO = 'photo'
}

// The types a player can actually collect today. `feedback` and `photo` have no collect flow yet, so
// collectPinHandle rejects them — which is exactly why they must NOT count toward a `pinsInScope`
// achievement target either: a scope holding one active feedback pin would otherwise have a
// denominator one higher than anyone can ever reach, making the badge permanently unobtainable.
// collectPinHandle and recomputeAchievementTargets BOTH read this, so they cannot drift apart.
export const COLLECTIBLE_PIN_TYPES: PinType[] = [PinType.CODE, PinType.RIDDLE, PinType.VISIT];

// Coordinate convention: x/y are pixels from the map image's top-left corner, y growing DOWN
// (what every image editor + #14's coord-picker produce). utils/maps.ts owns the sole `[-y, x]`
// swap into Leaflet's CRS.Simple space — never inline it. #16's real art must keep one canvas size
// per building or every coord points at the wrong room.
export type PinCoords = {
    x: number;
    y: number;
}

export type PinCollectedBy = {
    [uid: string]: {
        username: string;
        collectedAt: FieldValue;
    }
}

export type Pin = {
    uid: string;
    name: string;
    description: string;
    clue: string;
    type: PinType;
    groups: string[];
    mapId: string;
    coords: PinCoords;
    // A QR marker is AREA guidance ("the code is somewhere here"), not a precise dot: render a
    // translucent circle of this radius (CRS.Simple coordinate units, same space as coords) under it.
    // null = precise point.
    hintRadius: number | null;
    value: number;
    withQuestion: boolean;
    availableFrom: Timestamp | FieldValue | null;
    availableTo: Timestamp | FieldValue | null;
    isActive: boolean;
    code: string | null;
    collectedBy: PinCollectedBy;
}

// Explicit public whitelist returned by getPinsHandle — the ONLY shape the client may see of a pin.
// `code` (the secret) and `collectedBy` (uid->finder map: privacy leak + unbounded payload) are ABSENT
// BY CONSTRUCTION — getPinsHandle must map field-by-field into this type, never spread pinDoc.data().
// Do not widen without re-reading decision 13 (pins are admin-only read because the code is inline).
export type PublicPin = {
    uid: string;
    name: string;
    description: string;
    clue: string;
    type: PinType;
    groups: string[];
    mapId: string;
    coords: PinCoords;
    hintRadius: number | null;
    value: number;
    withQuestion: boolean;
    isActive: boolean;
    availableFrom: Timestamp | FieldValue | null;
    availableTo: Timestamp | FieldValue | null;
}

// Snapshot copy of the pin, the way collectedCards snapshots the card: name/description/value are
// duplicated here because `pins` is admin-only read, so the client can never resolve pins/{uid} itself.
export type CollectedPin = {
    uid: string;
    name: string;
    description: string;
    value: number;
    type: PinType;
    collectedAt: Timestamp | FieldValue;
    awardedPoints: number;
    talkName: string | null;
    rating: number | null;
}
