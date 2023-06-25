import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Timestamp = firestore.Timestamp;

export type Ranking = {
    roundUid: string,
    users: {
        [uid: string]: {
            username: string,
            score: number,
            amountOfCollectedCards: number,
            amountOfAnsweredQuestions: number,
            updatedAt: Timestamp | FieldValue,
        }
    }
}

