import FirebaseModel from '@/models/FirebaseModel';
import { doc, DocumentSnapshot, SnapshotOptions, writeBatch } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { isUserRole, UserRole } from '@/Enum/UserRole';
import { FireDoc } from '@/Enum/FireDoc';

export default class User extends FirebaseModel {
    uid: string;
    username: string;
    score: number;
    amountOfCollectedCards: number;
    role: UserRole;
    updatedAt: Date;

    constructor (
        uid: string,
        username: string = '',
        score: number = 0,
        amountOfCollectedCards: number = 0,
        role: UserRole = UserRole.USER,
        updatedAt: Date = new Date()
    ) {
        super();

        this.uid = uid;
        this.username = username;
        this.score = score;
        this.amountOfCollectedCards = amountOfCollectedCards;
        this.role = role;
        this.updatedAt = updatedAt;
    }

    public static async createAccount (uid: string, username: string) {
        const user = new User(uid, username);

        const userDoc = doc(firestore, FireDoc.USERS, user.uid);
        const usernameDoc = doc(firestore, FireDoc.USERS_USERNAMES, username);

        return await writeBatch(firestore)
            .set(userDoc, { ...user })
            .set(usernameDoc, { uid: user.uid })
            .commit();
    }

    protected static toFirestore (data: User): object {
        return {
            uid: data.uid,
            name: data.username,
            score: data.score,
            amountOfCollectedCards: data.amountOfCollectedCards,
            role: data.role
        };
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
            data.role,
            data.updatedAt.toDate()
        );
    }
}


