import { initializeApp } from 'firebase-admin/app';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { Card, User } from './firestoreTypes';

initializeApp();

exports.collectcard = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) {
        logger.error('collectcard', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const uid: string = request.auth.uid;
    const codeAttempt: string | null = request.data.code ?? null;

    if (typeof codeAttempt !== 'string' || codeAttempt.length !== 10) {
        logger.error('collectcard', 'uid or code is null');
        throw new HttpsError('invalid-argument', 'uid or code is null');
    }

    const db = getFirestore();
    const userRef = db.collection('users')
        .doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
        logger.error('collectcard', 'user uid does not exist');
        throw new HttpsError('not-found', 'user uid does not exist');
    }

    const cardSnapshot = await db.collection('cards')
        .where('code', '==', codeAttempt)
        .get();

    if (cardSnapshot.empty) {
        logger.error('collectcard', 'card code is invalid');
        throw new HttpsError('not-found', 'card code is invalid');
    }

    const cardDoc = cardSnapshot.docs[0];
    const cardRef = cardDoc.ref;

    const card: Card = cardDoc.data() as Card;
    const user: User = userSnapshot.data() as User;

    const isAlreadyCollected = card.collectedBy && uid in card.collectedBy;

    if (isAlreadyCollected) {
        logger.error('collectcard', 'card is already collected');
        throw new HttpsError('already-exists', 'card is already collected');
    }

    const collectedCardRef = userRef.collection('collected-cards')
        .doc(card.uid);

    const rankingRef = db.collection('users-ranking')
        .doc('ranking');

    const userScore = user.score + card.value;

    try {
        await db.runTransaction(async (transaction) => {
            transaction.create(collectedCardRef, {
                collection: card.collection,
                description: card.description,
                image: card.image,
                name: card.name,
                tier: card.tier,
                uid: card.uid,
                value: card.value,
                score: card.value,
                question: null,
                withQuestion: card.withQuestion,
                collectedAt: FieldValue.serverTimestamp()
            });

            transaction.update(userRef, {
                score: userScore,
                updatedAt: FieldValue.serverTimestamp()
            });

            transaction.update(cardRef, {
                [`collectedBy.${uid}`]: {
                    username: user.username,
                    collectedAt: FieldValue.serverTimestamp()
                }
            });

            transaction.set(rankingRef, {
                [`${uid}`]: {
                    username: user.username,
                    score: userScore,
                    updatedAt: FieldValue.serverTimestamp()
                }
            }, { merge: true });
        });
    } catch (error) {
        logger.error('collectcard', 'error while collecting card: ' + error);
        throw new HttpsError('aborted', 'error while collecting card');
    }

    logger.log('collectcard', user.username, `card code ${codeAttempt} is valid`);
    return {
        text: `ok`
    };
});

