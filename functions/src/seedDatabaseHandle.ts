import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { Card } from './types/card';
import { User, UserRole } from './types/user';
import { RankingRound } from './types/rankingRound';
import { CardSet } from './types/cardSet';
import rankingRoundsSeed from './seeds/rankingRoundsSeed';
import cardSetsSeed from './seeds/cardSetsSeed';
import questionsSeed from './seeds/questionsSeed';
import cardsSeed from './seeds/cardsSeed';
import guildsSeed from './seeds/guildsSeed';
import { Guild } from './types/guild';
import cluesSeed from './seeds/cluesSeed';
import { CardClue } from './types/cardClue';
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
    await seedCards(db);
    await seedPinGroups(db);
    await seedPins(db);
    await seedCardSets(db);
    await seedRounds(db);
    await seedGuilds(db);
    await seedClues(db);
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

// A bare .set() would reset every card's/pin's collectedBy to {} on re-seed while
// users/{uid}/collectedCards|collectedPins survives, desyncing the two (see CLAUDE.md §11). The
// tempting fix — `.set(doc, { merge: true })` while the seed literal still carries `collectedBy: {}` —
// does NOT work: Firestore's merge treats "the key is present in the payload" as "overwrite this path",
// regardless of whether its value is an empty object, so `collectedBy: {}` still wipes the existing
// map. The only merge-safe fix is to OMIT the key entirely from the write for a doc that already
// exists (merge then leaves that path untouched); a brand-new doc still gets an explicit `collectedBy`
// so the field is never simply absent.
async function seedWithPreservedCollectedBy<T extends { uid: string, collectedBy: unknown }> (
    db: FirebaseFirestore.Firestore,
    collection: string,
    docs: T[]
): Promise<void> {
    await Promise.all(docs.map(async (doc) => {
        const ref = db.collection(collection).doc(doc.uid);
        const { collectedBy, ...rest } = doc;

        if ((await ref.get()).exists) {
            await ref.set(rest, { merge: true });
        } else {
            await ref.set(doc);
        }
    }));
}

async function seedCards(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding cards');
    await seedWithPreservedCollectedBy(db, 'cards', cardsSeed as Card[]);
    logger.log('seedDatabaseHandle', 'seeding cards done');
}

async function seedPins(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding pins');
    await seedWithPreservedCollectedBy(db, 'pins', pinsSeed as Pin[]);
    logger.log('seedDatabaseHandle', 'seeding pins done');
}

async function seedCardSets(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding card sets');
    await Promise.all(cardSetsSeed.map((cardSet: CardSet) =>
        db.collection('cardSets').doc(cardSet.uid).set(cardSet)
    ));
    logger.log('seedDatabaseHandle', 'seeding card sets done');
}

async function seedRounds(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding rounds');
    await Promise.all(rankingRoundsSeed.map((round: RankingRound) =>
        db.collection('ranking').doc(round.uid).set(round, { merge: true })
    ));
    logger.log('seedDatabaseHandle', 'seeding rounds done');
}

async function seedGuilds(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding guilds');
    await Promise.all(guildsSeed.map((guild: Guild) =>
        db.collection('guilds').doc(guild.uid).set(guild, { merge: true })
    ));
    logger.log('seedDatabaseHandle', 'seeding guilds done');
}

async function seedClues(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding clues');
    await Promise.all(cluesSeed.map((clue: CardClue) =>
        db.collection('clues').doc(clue.uid).set(clue, { merge: true })
    ));
    logger.log('seedDatabaseHandle', 'seeding clues done');
}
