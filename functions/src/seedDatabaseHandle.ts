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
    await seedCardSets(db);
    await seedRounds(db);
    await seedGuilds(db);
    await seedClues(db);

    return { status: 'ok' };
});

async function seedQuestions(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding questions');
    await db.collection('questions').doc('questions').set(questionsSeed);
    logger.log('seedDatabaseHandle', 'seeding questions done');
}

async function seedCards(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding cards');
    cardsSeed.forEach((card: Card) => {
        db.collection('cards').doc(card.uid).set(card);
    });
    logger.log('seedDatabaseHandle', 'seeding cards done');
}

async function seedCardSets(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding card sets');
    cardSetsSeed.forEach((cardSet: CardSet) => {
        db.collection('cardSets').doc(cardSet.uid).set(cardSet);
    });
    logger.log('seedDatabaseHandle', 'seeding card sets done');
}

async function seedRounds(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding rounds');
    rankingRoundsSeed.forEach((round: RankingRound) => {
        db.collection('ranking').doc(round.uid).set(round, { merge: true });
    });
    logger.log('seedDatabaseHandle', 'seeding rounds done');
}

async function seedGuilds(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding guilds');
    guildsSeed.forEach((guild: Guild) => {
        db.collection('guilds').doc(guild.uid).set(guild, { merge: true });
    });
    logger.log('seedDatabaseHandle', 'seeding guilds done');
}

async function seedClues(db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding clues');
    cluesSeed.forEach((clue: CardClue) => {
        db.collection('clues').doc(clue.uid).set(clue, { merge: true });
    });
    logger.log('seedDatabaseHandle', 'seeding clues done');
}
