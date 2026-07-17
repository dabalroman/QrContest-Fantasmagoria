import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { GuildUid } from './guild';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    DASHBOARD = 'dashboard'
}

export type User = {
    uid: string,
    username: string,
    score: number,
    amountOfCollectedCards: number,
    amountOfAnsweredQuestions: number,
    amountOfCollectedPins: number,
    role: UserRole,
    memberOf: GuildUid | null,
    winnerInRound: string | null
    updatedAt: Timestamp | FieldValue | number,
    lastGuildChangeAt: Timestamp | FieldValue | number,
}

export type UserUsername = {
    uid: string,
}

export type UserCounterKey = 'amountOfCollectedCards' | 'amountOfAnsweredQuestions' | 'amountOfCollectedPins';

// User docs written before a counter existed simply lack that field, so `User` only holds true once
// these are applied — see getCurrentUser. Typed as a total Record: a new UserCounterKey without a
// default here is a compile error.
export const USER_COUNTER_DEFAULTS: Record<UserCounterKey, number> = {
    amountOfCollectedCards: 0,
    amountOfAnsweredQuestions: 0,
    amountOfCollectedPins: 0
};