import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';

export type Record = {
    uid: string,
    username: string,
    amountOfCollectedCards: number,
    score: number,
    updatedAt: Date,
}

export default class Ranking extends FirebaseModel {
    path = FireDoc.RANKING;

    records: Record[] = [];

    constructor (
        records: Record[]
    ) {
        super();

        this.records = records;
    }

    protected static toFirestore (data: Ranking): object {
        throw new Error('Ranking is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): Ranking {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        const rankingEntries: Record[] = Object.entries(data)
            .map(([uid, record]) => {
                return {
                    uid: uid,
                    username: record.username,
                    amountOfCollectedCards: record.amountOfCollectedCards,
                    score: record.score,
                    updatedAt: record.updatedAt.toDate()
                };
            })
            .sort((a: Record, b: Record) => {
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

        return new Ranking(rankingEntries);
    }
}


