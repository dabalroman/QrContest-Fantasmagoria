import { HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { User, UserRole } from '../types/user';

/**
 * Shared admin guard, extracted from the pattern inline in seedDatabaseHandle. Loads users/{uid} and
 * requires role === UserRole.ADMIN, else throws permission-denied. Used by the two new pin-editor
 * callables (upsertPinHandle, deletePinHandle).
 */
export default async function assertAdmin(
    db: FirebaseFirestore.Firestore,
    uid: string
): Promise<void> {
    const userSnapshot = await db.collection('users').doc(uid).get();

    if (!userSnapshot.exists || (userSnapshot.data() as User).role !== UserRole.ADMIN) {
        logger.error('assertAdmin', 'permission denied', uid);
        throw new HttpsError('permission-denied', 'permission denied');
    }
}
