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

export type PinCompletedBy = {
    [uid: string]: {
        username: string;
        completedAt: FieldValue;
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
    completedBy: PinCompletedBy;
}

// Snapshot copy of the pin, the way collectedCards snapshots the card: name/description/value are
// duplicated here because `pins` is admin-only read, so the client can never resolve pins/{uid} itself.
export type CompletedPin = {
    uid: string;
    name: string;
    description: string;
    value: number;
    type: PinType;
    completedAt: Timestamp | FieldValue;
    awardedPoints: number;
    talkName: string | null;
    rating: number | null;
}
