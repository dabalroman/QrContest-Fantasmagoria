import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export enum PinType {
    CODE = 'code',
    RIDDLE = 'riddle',
    VISIT = 'visit',
    FEEDBACK = 'feedback',
    PHOTO = 'photo'
}

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
    value: number;
    withQuestion: boolean;
    availableFrom: Timestamp | FieldValue | null;
    availableTo: Timestamp | FieldValue | null;
    isActive: boolean;
    code: string | null;
    collectedBy: PinCollectedBy;
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
