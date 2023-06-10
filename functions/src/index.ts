import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { Card, User } from './firestoreTypes';

initializeApp();

exports.collectcard = onRequest(async (request, response) => {
    const uid: string | null = request.body.data.uid ?? null;
    const codeAttempt: string | null = request.body.data.code ?? null;

    if (uid === null || codeAttempt === null) {
        response.status(400)
            .json({ result: 'Błąd aplikacji.' });
        logger.error('collectcard', 'uid or code is null');
        return;
    }

    const db = getFirestore();
    const userRef = db.collection('users')
        .doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
        response.status(400)
            .json({ result: 'Błąd aplikacji.' });
        logger.error('collectcard', 'user uid invalid');
        return;
    }

    const cardSnapshot = await db.collection('cards')
        .where('code', '==', codeAttempt)
        .get();

    if (cardSnapshot.empty) {
        response.status(404)
            .json({ result: 'Kod jest błędny.' });
        logger.log('collectcard', uid, `card code ${codeAttempt} is invalid`);
        return;
    }

    const cardDoc = cardSnapshot.docs[0];
    const cardRef = cardDoc.ref;

    const card: Card = cardDoc.data() as Card;
    const user: User = userSnapshot.data() as User;

    const isAlreadyCollected = card.collectedBy && uid in card.collectedBy;

    if (isAlreadyCollected) {
        response.status(400)
            .json({ result: 'Karta została już zebrana.' });
        logger.log('collectcard', uid, `card code ${codeAttempt} is already collected`);
        return;
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
        response.status(500)
            .json({ result: 'Błąd aplikacji.' });
        logger.error('collectcard', error);
        return;
    }

    response.status(200)
        .json({ result: 'Kod jest prawidłowy!' });
    logger.log('collectcard', user.username, `card code ${codeAttempt} is valid`);
});

