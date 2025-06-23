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
    role: UserRole,
    memberOf: GuildUid | null,
    winnerInRound: string | null
    updatedAt: Timestamp | FieldValue | number,
    lastGuildChangeAt: Timestamp | FieldValue | number,
}

export type UserUsername = {
    uid: string,
}