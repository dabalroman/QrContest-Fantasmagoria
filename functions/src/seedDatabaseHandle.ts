import { logger } from 'firebase-functions';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import questionsSeed from './seeds/questions';
import cardsSeed from './seeds/cards';
import { Question } from './types/question';
import { Card } from './types/card';
import { User, UserRole } from './types/user';
import roundsSeed from './seeds/rounds';

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

async function seedRounds (db: FirebaseFirestore.Firestore) {
    logger.log('seedDatabaseHandle', 'seeding rounds');
    await db.collection('ranking')
        .doc('rounds')
        .set(roundsSeed);
    logger.log('seedDatabaseHandle', 'seeding rounds done');
}
