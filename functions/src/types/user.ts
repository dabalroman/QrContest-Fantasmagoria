import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from 'firebase-admin';
import Timestamp = firestore.Timestamp;

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
    updatedAt: Timestamp | FieldValue,
}
