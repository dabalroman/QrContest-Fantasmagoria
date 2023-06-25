import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { Uid } from '@/types/global';

export type UserRankingRecord = {
    uid: Uid,
    username: string,
    score: number,
    amountOfCollectedCards: number,
    amountOfAnsweredQuestions: number,
    updatedAt: Date,
}

export default class RankingRound extends FirebaseModel {
    uid: Uid;
    name: string;
    from: Date;
    to: Date;
    users: UserRankingRecord[];

    constructor (
        uid: Uid,
        name: string,
        from: Date,
        to: Date,
        users: UserRankingRecord[]
    ) {
        super();

        this.uid = uid;
        this.name = name;
        this.from = from;
        this.to = to;
        this.users = users;
    }

    protected static toFirestore (data: RankingRound): object {
        throw new Error('Ranking is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): RankingRound {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        const rankingEntries: UserRankingRecord[] = Object.entries(data.users)
            .map(([uid, record]: [string, any]): UserRankingRecord => {
                return {
                    uid,
                    username: record.username,
                    amountOfCollectedCards: record.amountOfCollectedCards,
                    amountOfAnsweredQuestions: record.amountOfAnsweredQuestions,
                    score: record.score,
                    updatedAt: record.updatedAt.toDate()
                };
            })
            .sort((a: UserRankingRecord, b: UserRankingRecord) => {
                if (a.score > b.score) {
                    return -1;
                }

                if (a.score < b.score) {
                    return 1;
                }

                if (a.updatedAt > b.updatedAt) {
                    return -1;
                }

                if (a.updatedAt < b.updatedAt) {
                    return 1;
                }

                return 0;
            });

        return new RankingRound(
            data.uid,
            data.name,
            data.from.toDate(),
            data.to.toDate(),
            rankingEntries
        );
    }
}


