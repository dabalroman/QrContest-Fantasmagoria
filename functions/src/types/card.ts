import { FieldValue } from 'firebase-admin/lib/firestore';
import { firestore } from 'firebase-admin';
import Timestamp = firestore.Timestamp;

export enum CardTier {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export enum CardTierValue {
    COMMON = 10,
    RARE = 15,
    EPIC = 20,
    LEGENDARY = 30
}

export type CollectedBy = {
    [uid: string]: { username: string }
}

export type Card = {
    uid: string;
    cardSet: string;
    code: string;
    collectedBy: CollectedBy;
    description: string;
    image: string;
    isActive: boolean;
    comment: string;
    name: string;
    tier: CardTier;
    value: CardTierValue;
    withQuestion: boolean;
}

export type CollectedCardQuestion = { uid: string, isCorrect: boolean, value: number } | null;

export type CollectedCard = {
    cardSet: string,
    collectedAt: Timestamp | FieldValue
    description: string,
    image: string,
    name: string,
    question: CollectedCardQuestion,
    score: number,
    tier: CardTier,
    uid: string,
    value: CardTierValue,
    withQuestion: boolean,
}
