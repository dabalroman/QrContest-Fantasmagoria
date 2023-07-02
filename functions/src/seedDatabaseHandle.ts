import { logger } from 'firebase-functions';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import questionsSeed from './seeds/questionsSeed';
import cardsSeed from './seeds/cardsSeed';
import { Question } from './types/question';
import { Card } from './types/card';
import { User, UserRole } from './types/user';
import rankingRoundsSeed from './seeds/rankingRoundsSeed';
import { RankingRound } from './types/rankingRound';
import { CardSet } from './types/cardSet';
import cardSetsSeed from './seeds/cardSetsSeed';

export default async function seedDatabaseHandle (request: CallableRequest) {
    if (!request.auth || !request.auth.uid) {
        logger.error('seedDatabaseHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const uid: string = request.auth.uid;

    const db = getFirestore();
    const userRef = db.collection('users')
        .doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists || (userSnapshot.data() as User).role !== UserRole.ADMIN) {
        logger.error('seedDatabaseHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    await seedQuestions(db);
    await seedCards(db);
    await seedCardSets(db);
    await seedRounds(db);

    return {
        status: 'ok'
    };
};

async function seedQuestions (db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding questions');
    questionsSeed.forEach((question: Question) => {
        db.collection('questions')
            .doc(question.uid)
            .set(question);
    });
    logger.log('seedDatabaseHandle', 'seeding questions done');
}

async function seedCards (db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding cards');
    cardsSeed.forEach((card: Card) => {
        db.collection('cards')
            .doc(card.uid)
            .set(card);
    });
    logger.log('seedDatabaseHandle', 'seeding cards done');
}

async function seedCardSets (db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding card sets');
    cardSetsSeed.forEach((cardSet: CardSet) => {
        db.collection('cardSets')
            .doc(cardSet.uid)
            .set(cardSet);
    });
    logger.log('seedDatabaseHandle', 'seeding card sets done');
}

async function seedRounds (db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding rounds');
    rankingRoundsSeed.forEach((round: RankingRound) => {
        db.collection('ranking')
            .doc(round.uid)
            .set(round, { merge: true });
    });
    logger.log('seedDatabaseHandle', 'seeding rounds done');
}
