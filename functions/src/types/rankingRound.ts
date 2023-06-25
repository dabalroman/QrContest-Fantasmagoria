import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Timestamp = firestore.Timestamp;

export type RankingRound = {
    uid: string,
    name: string;
    from: Timestamp | FieldValue | Date;
    to: Timestamp | FieldValue | Date;
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
