import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { GuildUid } from './guild';
import { UserAchievement } from './achievement';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    DASHBOARD = 'dashboard'
}

// A player's unlocked achievements, keyed by the achievement's uid. Presence IS the exactly-once dup
// guard (see functions/src/achievements). Kept a map on the user doc, not a subcollection: it is
// already loaded by getCurrentUser on every award (zero extra reads on the hot path) and already
// live-synced to the client. There is deliberately no per-user clone of the definitions — those live
// in the readable `achievements` collection, so the UI joins the two instead.
export type UserAchievements = {
    [achievementUid: string]: UserAchievement
};

export type User = {
    uid: string,
    username: string,
    score: number,
    amountOfCollectedCards: number,
    amountOfAnsweredQuestions: number,
    amountOfCorrectAnswers: number,
    amountOfCollectedPins: number,
    achievements: UserAchievements,
    role: UserRole,
    memberOf: GuildUid | null,
    winnerInRound: string | null
    updatedAt: Timestamp | FieldValue | number,
    lastGuildChangeAt: Timestamp | FieldValue | number,
}

export type UserUsername = {
    uid: string,
}

export type UserCounterKey =
    | 'amountOfCollectedCards'
    | 'amountOfAnsweredQuestions'
    | 'amountOfCorrectAnswers'
    | 'amountOfCollectedPins';

// User docs written before a counter existed simply lack that field, so `User` only holds true once
// these are applied — see getCurrentUser. Typed as a total Record: a new UserCounterKey without a
// default here is a compile error.
export const USER_COUNTER_DEFAULTS: Record<UserCounterKey, number> = {
    amountOfCollectedCards: 0,
    amountOfAnsweredQuestions: 0,
    amountOfCorrectAnswers: 0,
    amountOfCollectedPins: 0
};