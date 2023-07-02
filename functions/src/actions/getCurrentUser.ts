import { User } from '../types/user';
import { logger } from 'firebase-functions';
import { HttpsError } from 'firebase-functions/v2/https';

export default async function getCurrentUser (
    db: FirebaseFirestore.Firestore,
    uid: string
): Promise<[userRef: FirebaseFirestore.DocumentReference, user: User]> {
    const userRef = db.collection('users')
        .doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
        logger.error('getCurrentUser', 'user uid does not exist');
        throw new HttpsError('not-found', 'user uid does not exist');
    }

    return [userRef, userSnapshot.data() as User];
}
