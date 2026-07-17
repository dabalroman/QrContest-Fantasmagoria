import { CardTier } from '@/Enum/CardTier';
import { PinType } from '@/Enum/PinType';
import { StringMap, Uid } from '@/types/global';

export type RawFirestoreTimestamp = { _seconds: number, _nanoseconds: number };

export interface RawCard {
    cardSet: string,
    code: string | undefined,
    collectedAt: RawFirestoreTimestamp,
    collectedBy: string[] | undefined,
    description: string,
    comment: string,
    image: string,
    isActive: boolean | undefined,
    name: string,
    score: number | undefined,
    tier: CardTier,
    uid: Uid | undefined,
    value: number,
    withQuestion: boolean
}

export interface RawQuestion {
    uid: string,
    question: string,
    answers: StringMap,
    value: number
}

export interface RawPin {
    uid: Uid,
    name: string,
    code: string | undefined,
    type: PinType,
    groups: string[],
    mapId: string,
    coords: { x: number, y: number },
    value: number,
    description: string,
    clue: string | undefined,
    withQuestion: boolean,
    isActive: boolean,
    availableFrom: RawFirestoreTimestamp | undefined,
    availableTo: RawFirestoreTimestamp | undefined
}

export interface RawCompletedPin {
    uid: Uid,
    name: string,
    description: string,
    value: number,
    type: PinType,
    completedAt: RawFirestoreTimestamp,
    awardedPoints: number,
    talkName: string | undefined,
    rating: number | undefined
}
