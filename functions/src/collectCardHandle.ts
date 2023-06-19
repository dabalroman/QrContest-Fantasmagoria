import { logger } from 'firebase-functions';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { Card, CollectedCard } from './types/card';
import { User } from './types/user';
import { CollectedQuestions, PublicQuestion, Question } from './types/question';
import { Ranking } from './types/ranking';

export default async function collectCardHandle (request: CallableRequest) {
    if (!request.auth || !request.auth.uid) {
        logger.error('collectCardHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    // Does code looks right?
    const uid: string = request.auth.uid;
    let codeAttempt: string | null = request.data.code ?? null;

    if (typeof codeAttempt !== 'string' || codeAttempt.length !== 10) {
        logger.error('collectCardHandle', 'uid or code is null');
        throw new HttpsError('invalid-argument', 'uid or code is null');
    }

    // Does user exist?
    const db = getFirestore();
    const userRef = db.collection('users')
        .doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
        logger.error('collectCardHandle', 'user uid does not exist');
        throw new HttpsError('not-found', 'user uid does not exist');
    }

    // Is card code valid?
    codeAttempt = codeAttempt.toUpperCase();
    const cardSnapshot = await db.collection('cards')
        .where('code', '==', codeAttempt)
        .where('isActive', '==', true)
        .get();

    if (cardSnapshot.empty) {
        logger.error('collectCardHandle', 'card code is invalid', codeAttempt);
        throw new HttpsError('not-found', 'card code is invalid');
    }

    // Was card already collected?
    const cardDoc = cardSnapshot.docs[0];
    const cardRef = cardDoc.ref;

    const card: Card = cardDoc.data() as Card;
    const user: User = userSnapshot.data() as User;

    const isAlreadyCollected = card.collectedBy && uid in card.collectedBy;

    if (isAlreadyCollected) {
        logger.error('collectCardHandle', 'card is already collected');
        throw new HttpsError('already-exists', 'card is already collected');
    }

    // Question
    let question: PublicQuestion | null = null;
    let questionRef: FirebaseFirestore.DocumentReference | null = null;
    if (card.withQuestion || true) {
        const collectedQuestionsDoc = await db.collection('users')
            .doc(uid)
            .collection('collectedQuestions')
            .doc('collectedQuestions')
            .get();

        const collectedQuestions = collectedQuestionsDoc.data() as CollectedQuestions;
        const alreadyCollected = collectedQuestions ? Object.keys(collectedQuestions) : [];

        // Pseudorandom document fetch by sorting by last globally answered question
        // on each access updatedAt timestamp must be updated
        const questionDoc = await db.collection('questions')
            .where('uid', 'not-in', alreadyCollected)
            .orderBy('updatedAt', 'asc')
            .limit(1)
            .get();

        if(questionDoc.docs[0]) {
            const questionData = questionDoc.docs[0].data() as Question;
            questionRef = questionDoc.docs[0].ref;

            question = {
                uid: questionData.uid,
                answers: questionData.answers,
                question: questionData.question,
                value: questionData.value
            };
        }
    }

    // Collect the card
    const collectedCardRef = userRef.collection('collectedCards')
        .doc(card.uid);

    const rankingRef = db.collection('ranking')
        .doc('ranking');

    const userScore = user.score + card.value;
    const userCollectedCards = user.amountOfCollectedCards + 1;

    try {
        await db.runTransaction(async (transaction) => {
            transaction.create(collectedCardRef, {
                cardSet: card.cardSet,
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
            } as CollectedCard);

            transaction.update(userRef, {
                score: userScore,
                amountOfCollectedCards: userCollectedCards,
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
                    amountOfCollectedCards: userCollectedCards,
                    updatedAt: FieldValue.serverTimestamp()
                }
            } as Ranking, { merge: true });

            if (question && questionRef) {
                transaction.update(questionRef, {
                    updatedAt: FieldValue.serverTimestamp()
                });
            }
        });
    } catch (error) {
        logger.error('collectCardHandle', 'error while collecting card: ' + error);
        throw new HttpsError('aborted', 'error while collecting card');
    }

    logger.log('collectCardHandle', user.username, `card code ${codeAttempt} is valid`);
    return {
        card: (await collectedCardRef.get()).data() as CollectedCard,
        question: question as PublicQuestion
    };
};
