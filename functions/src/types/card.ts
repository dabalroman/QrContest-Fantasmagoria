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
    cardSet: string;
    code: string;
    collectedBy: CollectedBy;
    description: string;
    comment: string;
    image: string;
    isActive: boolean;
    name: string;
    tier: CardTier;
    uid: string;
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
