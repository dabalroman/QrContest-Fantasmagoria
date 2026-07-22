import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { PhotoSubmission, PhotoSubmissionStatus } from './types/photoSubmission';
import assertAdmin from './actions/assertAdmin';
import { photoBucket, photoDownloadUrl } from './actions/photoStorage';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// One row of the admin review queue. `username`/`pinName` are denormalized onto the submission, so no
// extra reads. `photoUrl` is a server-built Firebase download-token URL (no signBlob) - null when the
// object's token metadata could not be read, so one broken object never 500s the whole queue.
type PhotoSubmissionRow = {
    submissionUid: string,
    userUid: string,
    username: string,
    pinUid: string,
    pinName: string,
    value: number,
    submittedAt: Timestamp,
    photoUrl: string | null
};

// Admin-only read path for the photo-review queue (#19). Returns only PENDING submissions. The query is
// a single-field equality (status == 'pending', auto-indexed); ordering is done in-memory to avoid a
// composite index deploy - the pending set is tiny.
export const getPhotoSubmissionsHandle = onCall(async (req): Promise<{ submissions: PhotoSubmissionRow[] }> => {
    const auth = req.auth;
    if (!auth || !auth.uid) {
        logger.error('getPhotoSubmissionsHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const db = getFirestore();
    await assertAdmin(db, auth.uid);

    const snapshot = await db.collection('photoSubmissions')
        .where('status', '==', PhotoSubmissionStatus.PENDING)
        .get();

    const submissions = await Promise.all(snapshot.docs.map(async (doc): Promise<PhotoSubmissionRow> => {
        const sub = doc.data() as PhotoSubmission;

        let photoUrl: string | null = null;
        try {
            const [metadata] = await photoBucket().file(sub.storagePath).getMetadata();
            const tokens = metadata.metadata?.firebaseStorageDownloadTokens;
            if (typeof tokens === 'string' && tokens.length > 0) {
                photoUrl = photoDownloadUrl(sub.storagePath, tokens.split(',')[0]);
            }
        } catch (error) {
            logger.warn('getPhotoSubmissionsHandle', 'could not resolve photo url for ' + sub.storagePath, error);
        }

        return {
            submissionUid: sub.uid,
            userUid: sub.userUid,
            username: sub.username,
            pinUid: sub.pinUid,
            pinName: sub.pinName,
            value: sub.value,
            submittedAt: sub.submittedAt as Timestamp,
            photoUrl
        };
    }));

    submissions.sort((a, b) => a.submittedAt.toMillis() - b.submittedAt.toMillis());

    return { submissions };
});
