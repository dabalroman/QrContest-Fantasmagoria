import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { isUserRole, UserRole } from '@/Enum/UserRole';

export default class User extends FirebaseModel {
    uid: string;
    username: string;
    score: number;
    amountOfCollectedCards: number;
    amountOfAnsweredQuestions: number;
    role: UserRole;
    updatedAt: Date;

    constructor (
        uid: string,
        username: string = '',
        score: number = 0,
        amountOfCollectedCards: number = 0,
        amountOfAnsweredQuestions: number = 0,
        role: UserRole = UserRole.USER,
        updatedAt: Date = new Date()
    ) {
        super();

        this.uid = uid;
        this.username = username;
        this.score = score;
        this.amountOfCollectedCards = amountOfCollectedCards;
        this.amountOfAnsweredQuestions = amountOfAnsweredQuestions;
        this.role = role;
        this.updatedAt = updatedAt;
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
            data.role,
            data.updatedAt.toDate()
        );
    }
}


