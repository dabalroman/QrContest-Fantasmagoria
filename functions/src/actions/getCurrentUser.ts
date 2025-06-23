import {User} from '../types/user';
import {logger} from 'firebase-functions';
import {HttpsError} from 'firebase-functions/v2/https';
import {DocumentReference} from "firebase-admin/firestore";

export default async function getCurrentUser(
    db: FirebaseFirestore.Firestore,
    uid: string
): Promise<[userRef: DocumentReference<User, User>, user: User]> {
    const userRef = db.collection('users')
        .doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
        logger.error('getCurrentUser', 'user uid does not exist');
        throw new HttpsError('not-found', 'user uid does not exist');
    }

    return [userRef as DocumentReference<User, User>, userSnapshot.data() as User];
}
