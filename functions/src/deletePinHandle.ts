import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import assertAdmin from './actions/assertAdmin';
import recomputeAchievementTargets from './actions/recomputeAchievementTargets';

// Not transactional — there is no invariant to protect. The client warns when a pin's collectedBy is
// non-empty; the server does not block a delete either way, since collectedPins are snapshots and the
// score was already fanned out at collect time.
export const deletePinHandle = onCall(async (req): Promise<{ status: string }> => {
    const auth = req.auth;

    if (!auth || !auth.uid) {
        logger.error('deletePinHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const db = getFirestore();
    await assertAdmin(db, auth.uid);

    const pinUid: string | null = typeof req.data.pinUid === 'string' ? req.data.pinUid : null;
    if (!pinUid) {
        logger.error('deletePinHandle', 'pinUid is required');
        throw new HttpsError('invalid-argument', 'pinUid is required');
    }

    await db.collection('pins').doc(pinUid).delete();

    // Never throws (see recomputeAchievementTargets) — a target-recompute hiccup cannot turn a
    // successful delete into a reported error.
    await recomputeAchievementTargets(db);

    logger.log('deletePinHandle', `pin ${pinUid} deleted`);
    return { status: 'ok' };
});
