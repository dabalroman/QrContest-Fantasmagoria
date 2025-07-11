import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { isUserRole, UserRole } from '@/Enum/UserRole';
import { GuildUid } from '@/models/Guild';

export default class User extends FirebaseModel {
    uid: string;
    username: string;
    score: number;
    amountOfCollectedCards: number;
    amountOfAnsweredQuestions: number;
    memberOf: GuildUid | null;
    role: UserRole;
    winnerInRound: string | null;
    updatedAt: Date;
    lastGuildChangeAt: Date;

    constructor (
        uid: string,
        username: string = '',
        score: number = 0,
        amountOfCollectedCards: number = 0,
        amountOfAnsweredQuestions: number = 0,
        memberOf: GuildUid | null = null,
        role: UserRole = UserRole.USER,
        winnerInRound: string | null = null,
        updatedAt: Date = new Date(),
        lastGuildChangeAt: Date = new Date(),
    ) {
        super();

        this.uid = uid;
        this.username = username;
        this.score = score;
        this.amountOfCollectedCards = amountOfCollectedCards;
        this.amountOfAnsweredQuestions = amountOfAnsweredQuestions;
        this.memberOf = memberOf;
        this.role = role;
        this.winnerInRound = winnerInRound;
        this.updatedAt = updatedAt;
        this.lastGuildChangeAt = lastGuildChangeAt;
    }

    protected static toFirestore (data: User): object {
        throw new Error('User is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): User {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        if (!isUserRole(data.role)) {
            throw new Error(`Invalid value '${snapshot.data()?.role}' for user.role`);
        }

        return new User(
            data.uid,
            data.username,
            data.score,
            data.amountOfCollectedCards,
            data.amountOfAnsweredQuestions,
            data.memberOf,
            data.role,
            data.winnerInRound,
            data.updatedAt.toDate(),
            data.lastGuildChangeAt.toDate()
        );
    }

    public isAdmin() {
        return this.role === UserRole.ADMIN;
    }

    public isDashboard() {
        return this.role === UserRole.DASHBOARD;
    }
}


