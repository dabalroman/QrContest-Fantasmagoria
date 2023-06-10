import FirebaseModel from '@/models/FirebaseModel';
import { doc, getDoc, updateDoc, writeBatch } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { isUserRole, UserRole } from '@/Enum/UserRole';
import { FireDoc } from '@/Enum/FireDoc';

export default class User extends FirebaseModel {
    uid: string;
    username: string;
    score: number = 0;
    role: UserRole = UserRole.USER;

    path = FireDoc.USERS;

    constructor (
        uid: string,
        username: string = '',
        score: number = 0,
        role: UserRole = UserRole.USER
    ) {
        super();

        this.uid = uid;
        this.username = username;
        this.score = score;
        this.role = role;
    }

    public static async fromUid (uid: string): Promise<User | null> {
        const userDoc = doc(firestore, 'users', uid);
        const snapshot = await getDoc(userDoc);

        if(snapshot.data() === undefined) {
            return null;
        }

        if(!isUserRole(snapshot.data()?.role)) {
            throw new Error(`Invalid value '${snapshot.data()?.role}' for user.role`);
        }

        return new User(
            uid,
            snapshot.data()?.username,
            snapshot.data()?.score,
            snapshot.data()?.role
        );
    }

    public async save(): Promise<void> {
        const userDoc = doc(firestore, FireDoc.USERS, this.uid);

        await updateDoc(userDoc, {
            username: this.username,
            score: this.score,
            role: this.role
        }).then(x => console.log(x)).catch((reason) => console.error(reason));
    }

    public static async createAccount(uid: string, username: string) {
        const user = new User(uid, username);

        const userDoc = doc(firestore, FireDoc.USERS, user.uid);
        const usernameDoc = doc(firestore, FireDoc.USERS_USERNAMES, username);

        return await writeBatch(firestore)
            .set(userDoc, { ...user })
            .set(usernameDoc, { uid: user.uid })
            .commit();
    }
}


