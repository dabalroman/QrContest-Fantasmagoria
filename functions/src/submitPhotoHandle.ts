import { FieldValue, getFirestore, UpdateData } from 'firebase-admin/firestore';
import { Pin, PinCollectedBy, PinType } from './types/pin';
import { PhotoSubmission, PhotoSubmissionStatus } from './types/photoSubmission';
import { User } from './types/user';
import getCurrentUser from './actions/getCurrentUser';
import scopeKeys from './actions/pinScopeKeys';
import { assertPinIsActive, assertPinIsAvailable, assertPinIsNotAlreadyCollected } from './actions/assertPin';
import { photoBucket, photoStoragePath } from './actions/photoStorage';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// The `photo`-type pin submit path (#19). The client has ALREADY uploaded the downscaled blob to
// Storage at users/{uid}/photos/{pinUid} (under the narrow owner-only storage.rules) before calling
// this. We validate the pin server-side (never trusting the client), verify the object exists, then
// mark the pin PENDING - no points. Points are awarded only later by reviewPhotoHandle on approval.
//
// A photo pin is reachable ONLY from the map's pin sheet (the {pinUid} path); collectPinHandle keeps
// rejecting `photo`, so the two flows never overlap.
export const submitPhotoHandle = onCall(async (req): Promise<{ submissionUid: string, status: string }> => {
    const data = req.data;
    const auth = req.auth;
    if (!auth || !auth.uid) {
        logger.error('submitPhotoHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const uid: string = auth.uid;
    const pinUid: string | null = typeof data.pinUid === 'string' ? data.pinUid : null;
    if (!pinUid) {
        logger.error('submitPhotoHandle', 'pinUid is null');
        throw new HttpsError('invalid-argument', 'pinUid is null');
    }

    const db = getFirestore();
    const [userRef, user] = await getCurrentUser(db, uid);

    const pinRef = db.collection('pins').doc(pinUid);
    const pinDoc = await pinRef.get();
    if (!pinDoc.exists) {
        logger.error('submitPhotoHandle', 'pin uid is invalid', pinUid);
        throw new HttpsError('not-found', 'pin uid is invalid');
    }

    const pin = pinDoc.data() as Pin;

    if (pin.type !== PinType.PHOTO) {
        logger.error('submitPhotoHandle', 'pin is not a photo pin', pin.type);
        throw new HttpsError('invalid-argument', 'pin is not a photo pin');
    }

    assertPinIsActive(pin);
    assertPinIsAvailable(pin);
    assertPinIsNotAlreadyCollected(pin, uid);

    // Verify the object the client claims to have uploaded actually exists - a submit with no prior
    // upload is rejected. This is a Storage READ (works against the emulator under the narrow rule).
    const storagePath = photoStoragePath(uid, pinUid);
    const [objectExists] = await photoBucket().file(storagePath).exists();
    if (!objectExists) {
        logger.error('submitPhotoHandle', 'photo object not found', storagePath);
        throw new HttpsError('failed-precondition', 'photo not uploaded');
    }

    // Captured ONCE - used for BOTH the pendingScore increment and the submission snapshot, so they can
    // never disagree.
    const value = pin.value;

    const collectedPinRef = userRef.collection('collectedPins').doc(pin.uid);
    const submissionRef = db.collection('photoSubmissions').doc();

    try {
        await db.runTransaction(async (transaction) => {
            // Greying the map marker (collectedPins) is written ONLY here, only after the upload - so a
            // dropped step leaves no partial state; the client shows an error and the retry overwrites
            // the same Storage object. transaction.create ALSO bounds pending to ≤1 per (player, pin):
            // it throws ALREADY_EXISTS if the snapshot is already present.
            transaction.create(collectedPinRef, {
                uid: pin.uid,
                name: pin.name,
                description: pin.description,
                value,
                type: pin.type,
                collectedAt: FieldValue.serverTimestamp(),
                awardedPoints: 0         // 0 while pending - set to `value` on approval
            });

            transaction.update<PinCollectedBy, PinCollectedBy>(pinRef, {
                [`collectedBy.${uid}`]: {
                    username: user.username,
                    collectedAt: FieldValue.serverTimestamp()
                }
            } as UpdateData<PinCollectedBy>);

            const submission: PhotoSubmission = {
                uid: submissionRef.id,
                userUid: uid,
                username: user.username,
                pinUid: pin.uid,
                pinName: pin.name,
                storagePath,
                value,
                scopeKeys: scopeKeys(pin),
                status: PhotoSubmissionStatus.PENDING,
                submittedAt: FieldValue.serverTimestamp(),
                reviewedAt: null,
                reviewedBy: null
            };
            transaction.create(submissionRef, submission);

            // No score, no fan-out, no counter - those all happen on approval.
            transaction.update<User, User>(userRef, {
                pendingScore: FieldValue.increment(value),
                updatedAt: FieldValue.serverTimestamp()
            } as UpdateData<User>);
        });

        logger.log('submitPhotoHandle', user.username, `photo submitted for pin ${pin.uid}`);
        return { submissionUid: submissionRef.id, status: PhotoSubmissionStatus.PENDING };
    } catch (error) {
        logger.error('submitPhotoHandle', 'error while submitting photo: ' + error);
        throw new HttpsError('aborted', 'error while submitting photo');
    }
});
