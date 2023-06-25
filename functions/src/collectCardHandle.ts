import { logger } from 'firebase-functions';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { Card, CollectedCard } from './types/card';
import { CollectedQuestions, PublicQuestion, Question } from './types/question';
import prepareRankingToUpdate from './actions/prepareRankingToUpdate';
import getCurrentUser from './actions/getCurrentUser';

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
    const [userRef, user] = await getCurrentUser(db, uid);

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

    // Is card already collected?
    const cardDoc = cardSnapshot.docs[0];
    const cardRef = cardDoc.ref;

    const card: Card = cardDoc.data() as Card;

    const isAlreadyCollected = card.collectedBy && uid in card.collectedBy;

    if (isAlreadyCollected) {
        logger.error('collectCardHandle', 'card is already collected');
        throw new HttpsError('already-exists', 'card is already collected');
    }

    // Question
    let question: PublicQuestion | null = null;
    let questionRef: FirebaseFirestore.DocumentReference | null = null;
    let collectedQuestionsRef: FirebaseFirestore.DocumentReference = db.collection('users')
        .doc(uid)
        .collection('collectedQuestions')
        .doc('collectedQuestions');

    if (card.withQuestion || true) {
        const collectedQuestionsDoc = await collectedQuestionsRef.get();

        const collectedQuestions = collectedQuestionsDoc.data() as CollectedQuestions;
        const alreadyCollected = collectedQuestions ? Object.keys(collectedQuestions) : ['empty-array'];

        // Pseudorandom document fetch by sorting by last globally answered question
        // on each access updatedAt timestamp must be updated
        const questionDoc = await db.collection('questions')
            .where('uid', 'not-in', alreadyCollected)
            .orderBy('updatedAt', 'asc')
            .limit(1)
            .get();

        if (questionDoc.docs[0]) {
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

    user.score += card.value;
    user.amountOfCollectedCards += 1;

    const [rankingRef, ranking] = await prepareRankingToUpdate(db, user);

    try {
        await db.runTransaction(async (transaction) => {
            //Collect card
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

            //Update user score and amount of collected cards
            transaction.update(userRef, {
                score: user.score,
                amountOfCollectedCards: user.amountOfCollectedCards,
                updatedAt: FieldValue.serverTimestamp()
            });

            //Update card collectedBy
            transaction.update(cardRef, {
                [`collectedBy.${uid}`]: {
                    username: user.username,
                    collectedAt: FieldValue.serverTimestamp()
                }
            });

            //Update ranking
            transaction.set(rankingRef, ranking, { merge: true });

            //Questions
            if (question && questionRef) {
                //Update question so the other users won't get it on next access
                transaction.update(questionRef, {
                    updatedAt: FieldValue.serverTimestamp()
                });

                //Save that user tried to answer this question
                transaction.set(collectedQuestionsRef, {
                    [question.uid]: {
                        answer: null,
                        correct: false,
                        value: 0
                    }
                }, { merge: true });
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
