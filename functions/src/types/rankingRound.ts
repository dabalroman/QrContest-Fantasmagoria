import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { GuildUid } from './guild';
import Timestamp = firestore.Timestamp;

export type RankingRoundUser = {
    username: string,
    score: number,
    amountOfCollectedCards: number,
    amountOfAnsweredQuestions: number,
    memberOf: GuildUid | null,
    updatedAt: Timestamp | FieldValue,
}

export type RankingRoundGuild = {
    name: string,
    score: number,
    amountOfAnsweredQuestions: number,
    amountOfCollectedCards: number,
    amountOfMembers: number,
    updatedAt: Timestamp | FieldValue,
}

export type RankingRound = {
    uid: string,
    name: string;
    from: Timestamp | FieldValue | Date;
    to: Timestamp | FieldValue | Date;
    users: {
        [uid: string]: RankingRoundUser
    },
    guilds: {
        [uid: string]: RankingRoundGuild
    }
}
