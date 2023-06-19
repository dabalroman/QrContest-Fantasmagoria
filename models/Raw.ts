import { CardTier } from '@/Enum/CardTier';
import { StringMap, Uid } from '@/types/global';

export type RawFirestoreTimestamp = { _seconds: number, _nanoseconds: number };

export interface RawCard {
    cardSet: string,
    code: string | undefined,
    collectedAt: RawFirestoreTimestamp,
    collectedBy: string[] | undefined,
    description: string,
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
