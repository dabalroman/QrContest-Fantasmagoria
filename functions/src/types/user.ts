import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from 'firebase-admin';
import { GuildUid } from './guild';
import Timestamp = firestore.Timestamp;

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    DASHBOARD = 'dashboard'
}

export type User = {
    uid: string,
    username: string,
    score: number | FieldValue,
    amountOfCollectedCards: number | FieldValue,
    amountOfAnsweredQuestions: number | FieldValue,
    role: UserRole,
    memberOf: GuildUid | null,
    updatedAt: Timestamp | FieldValue,
    lastGuildChangeAt: Timestamp | FieldValue,
}
