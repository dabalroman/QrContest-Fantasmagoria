import {FieldValue, Timestamp} from 'firebase-admin/firestore';
import {CollectedCardQuestion} from "./question";

export enum CardTier {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary',
    MYTHICAL = 'mythical'
}

export enum CardTierValue {
    COMMON = 10,
    RARE = 15,
    EPIC = 20,
    LEGENDARY = 30,
    MYTHICAL = 50
}

export type CardCollectedBy = {
    [uid: string]: {
        username: string;
        collectedAt: FieldValue;
    }
}

export type Card = {
    uid: string;
    cardSet: string;
    code: string;
    collectedBy: CardCollectedBy;
    description: string;
    image: string;
    isActive: boolean;
    comment: string;
    name: string;
    tier: CardTier;
    value: CardTierValue;
    withQuestion: boolean;
}

export type CollectedCard = {
    cardSet: string,
    collectedAt: Timestamp | FieldValue
    description: string,
    image: string,
    name: string,
    question: CollectedCardQuestion | null,
    score: number,
    tier: CardTier,
    uid: string,
    value: CardTierValue,
    withQuestion: boolean,
}
