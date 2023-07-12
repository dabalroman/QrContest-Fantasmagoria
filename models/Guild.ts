import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { Uid } from '@/types/global';

export type GuildMember = {
    uid: Uid,
    username: string,
    score: number,
    joinedAt: Date;
}

export enum GuildUid {
    desert = 'guild-desert',
    steel = 'guild-steel',
    water = 'guild-water',
    void = 'guild-void'
}

export default class Guild extends FirebaseModel {
    uid: GuildUid;
    name: string;
    score: number;
    power: number;
    amountOfMembers: number;
    amountOfCollectedCards: number;
    amountOfAnsweredQuestions: number;
    members: GuildMember[];
    updatedAt: Date;

    constructor (
        uid: GuildUid,
        name: string = '',
        score: number = 0,
        amountOfMembers: number,
        amountOfCollectedCards: number = 0,
        amountOfAnsweredQuestions: number = 0,
        members: GuildMember[] = [],
        updatedAt: Date = new Date()
    ) {
        super();

        this.uid = uid;
        this.name = name;
        this.score = score;
        this.amountOfMembers = amountOfMembers;
        this.amountOfCollectedCards = amountOfCollectedCards;
        this.amountOfAnsweredQuestions = amountOfAnsweredQuestions;
        this.members = members;
        this.updatedAt = updatedAt;
        this.power = amountOfMembers !== 0 ? Math.round(score / amountOfMembers) : 0;
    }

    protected static toFirestore (data: Guild): object {
        throw new Error('Guild is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): Guild {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        const members: GuildMember[] = Object.entries(data.members)
            .map(([uid, record]: [string, any]): GuildMember => {
                return {
                    uid,
                    username: record.username,
                    score: record.score,
                    joinedAt: record.joinedAt.toDate()
                };
            });

        return new Guild(
            data.uid,
            data.name,
            data.score,
            data.amountOfMembers,
            data.amountOfCollectedCards,
            data.amountOfAnsweredQuestions,
            members,
            data.updatedAt.toDate()
        );
    }
}
