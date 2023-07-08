import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Timestamp = firestore.Timestamp;
import { GuildUid } from './guild';

export type RankingRoundUser = {
    username: string,
    score: number,
    amountOfCollectedCards: number,
    amountOfAnsweredQuestions: number,
    memberOf: GuildUid | null,
    updatedAt: Timestamp | FieldValue,
}

export type RankingRound = {
    uid: string,
    name: string;
    from: Timestamp | FieldValue | Date;
    to: Timestamp | FieldValue | Date;
    users: {
        [uid: string]: RankingRoundUser
    }
}
