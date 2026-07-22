import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { User, UserRole } from './types/user';
import rankingRoundsSeed from './seeds/rankingRoundsSeed';
import questionsSeed from './seeds/questionsSeed';
import pinsSeed from './seeds/pinsSeed';
import { Pin } from './types/pin';
import achievementsSeed from './seeds/achievementsSeed';
import { Achievement } from './types/achievement';
import pinGroupsSeed from './seeds/pinGroupsSeed';
import { PinGroup } from './types/pinGroup';
import recomputeAchievementTargets from './actions/recomputeAchievementTargets';

export const seedDatabaseHandle = onCall(async (req): Promise<{}> => {
    const data = req.data;
    const auth = req.auth;

    if (!auth || !auth.uid) {
        logger.error('seedDatabaseHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    if (!data.password || data.password !== '4064') {
        logger.error('seedDatabaseHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const uid: string = auth.uid;
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists || (userSnapshot.data() as User).role !== UserRole.ADMIN) {
        logger.error('seedDatabaseHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    await seedQuestions(db);
    await seedPinGroups(db);
    await seedPins(db);
    await seedRounds(db);
    await seedAchievements(db);

    // MUST come after seedAchievements: that seed uses a bare .set(), which would otherwise clobber
    // the recomputed target back to the authored `target: 0`.
    await recomputeAchievementTargets(db);

    return { status: 'ok' };
});

async function seedPinGroups(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding pin groups');
    await Promise.all(pinGroupsSeed.map((pinGroup: PinGroup) =>
        db.collection('pinGroups').doc(pinGroup.uid).set(pinGroup, { merge: true })
    ));
    logger.log('seedDatabaseHandle', 'seeding pin groups done');
}

async function seedAchievements(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding achievements');
    await Promise.all(achievementsSeed.map((achievement: Achievement) =>
        db.collection('achievements').doc(achievement.uid).set(achievement)
    ));
    logger.log('seedDatabaseHandle', 'seeding achievements done');
}

async function seedQuestions(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding questions');
    await db.collection('questions').doc('questions').set(questionsSeed);
    logger.log('seedDatabaseHandle', 'seeding questions done');
}

// A bare .set() would reset live gameplay state on re-seed - a pin's collectedBy while
// users/{uid}/collectedPins survives, or a round's accumulated users map and its finished flag
// (see CLAUDE.md §11). The tempting fix - `.set(doc, { merge: true })` while the seed
// literal still carries `collectedBy: {}` / `users: {}` - does NOT work: Firestore's merge treats
// "the key is present in the payload" as "overwrite this path", regardless of whether its value is
// an empty object, so the empty literal still wipes the existing map. The only merge-safe fix is to
// OMIT those keys entirely from the write for a doc that already exists (merge then leaves those
// paths untouched); a brand-new doc still gets them explicitly so they are never simply absent.
async function seedWithPreservedFields<T extends { uid: string }> (
    db: FirebaseFirestore.Firestore,
    collection: string,
    docs: T[],
    preservedKeys: (keyof T)[]
): Promise<void> {
    await Promise.all(docs.map(async (doc) => {
        const ref = db.collection(collection).doc(doc.uid);

        if (!(await ref.get()).exists) {
            await ref.set(doc);
            return;
        }

        const payload: Partial<T> = { ...doc };
        preservedKeys.forEach((key) => delete payload[key]);
        await ref.set(payload, { merge: true });
    }));
}

async function seedPins(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding pins');
    await seedWithPreservedFields(db, 'pins', pinsSeed as Pin[], ['collectedBy']);
    logger.log('seedDatabaseHandle', 'seeding pins done');
}

async function seedRounds(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding rounds');
    await seedWithPreservedFields(db, 'ranking', rankingRoundsSeed, ['users', 'finished']);
    logger.log('seedDatabaseHandle', 'seeding rounds done');
}
