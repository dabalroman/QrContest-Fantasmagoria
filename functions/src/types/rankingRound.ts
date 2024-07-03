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
    winnerInRound: string | null,
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

export type RankingRoundUsers = {
    [uid: string]: RankingRoundUser
}

export type RankingRoundGuilds = {
    [uid: string]: RankingRoundGuild
}

export type RankingRound = {
    uid: string,
    name: string,
    finished: boolean,
    from: Timestamp | FieldValue | Date,
    to: Timestamp | FieldValue | Date,
    users: RankingRoundUsers,
    guilds: RankingRoundGuilds
}
