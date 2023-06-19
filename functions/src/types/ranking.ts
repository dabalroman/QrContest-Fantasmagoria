import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Timestamp = firestore.Timestamp;

export type Ranking = {
    [uid: string]: {
        username: string,
        score: number,
        amountOfCollectedCards: number,
        updatedAt: Timestamp | FieldValue
    }
}

