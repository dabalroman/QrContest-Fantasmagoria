import {getFirestore} from 'firebase-admin/firestore';
import {Pin, PublicPin} from './types/pin';
import {HttpsError, onCall} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import toPublicPin from './actions/toPublicPin';

// The map's read path - the first read-only callable in the repo. `pins` is admin-only read
// (the secret `code` is inline), so the client cannot query the collection directly. This returns a
// server-built whitelist instead.
//
// Filters `isActive == true` server-side ONLY (single-field, auto-indexed). The availability window is
// filtered CLIENT-side by clock - do NOT add `.where('availableTo', ...)`: Firestore sorts null first,
// which would drop every `availableTo: null` pin, i.e. almost the whole game. collectPinHandle still
// enforces the window server-side, so the client filter is purely cosmetic.
export const getPinsHandle = onCall(async (req): Promise<{ pins: PublicPin[] }> => {
    const auth = req.auth;
    if (!auth || !auth.uid) {
        logger.error('getPinsHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const db = getFirestore();
    const snapshot = await db.collection('pins')
        .where('isActive', '==', true)
        .get();

    // Load-bearing anti-leak line: map field-by-field into PublicPin via the shared helper. NEVER
    // `...doc.data()` - that would hand every player every code (and every riddle answer) plus the
    // full collectedBy finder map.
    const pins: PublicPin[] = snapshot.docs.map((doc) => toPublicPin(doc.data() as Pin));

    return {pins};
});
