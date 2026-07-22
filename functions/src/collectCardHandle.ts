import {FieldValue, getFirestore, UpdateData} from 'firebase-admin/firestore';
import {Card, CardCollectedBy, CollectedCard} from './types/card';
import {CollectedCardQuestion, CollectedQuestions, PublicQuestion, Question, QuestionsDoc} from './types/question';
import getCurrentUser, { readUserInTransaction } from './actions/getCurrentUser';
import awardPoints from './actions/awardPoints';
import {AchievementGrant} from './types/achievement';
import {HttpsError, onCall} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

export const collectCardHandle = onCall(async (req): Promise<{
    card: CollectedCard,
    question: PublicQuestion | null,
    achievements: AchievementGrant[]
}> => {
    const data = req.data;
    const auth = req.auth;
    if (!auth || !auth.uid) {
        logger.error('collectCardHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    // Does code looks right?
    const uid: string = auth.uid;
    let codeAttempt: string | null = data.code ?? null;

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
    const questionsRef: FirebaseFirestore.DocumentReference = db.collection('questions')
        .doc('questions');

    const collectedQuestionsRef: FirebaseFirestore.DocumentReference = db.collection('users')
        .doc(uid)
        .collection('collectedQuestions')
        .doc('collectedQuestions');

    if (card.withQuestion) {
        const questionsDoc = await questionsRef.get();
        const questionsData = questionsDoc.data() as QuestionsDoc;
        const questions = Object.values(questionsData) as Question[];

        const collectedQuestionsDoc = await collectedQuestionsRef.get();
        const collectedQuestions = collectedQuestionsDoc.data() as CollectedQuestions;
        const alreadyCollected = (collectedQuestions && Object.keys(collectedQuestions).length !== 0)
            ? Object.keys(collectedQuestions)
            : ['empty-array'];

        const unansweredQuestions = questions.filter((question: Question) => !alreadyCollected.includes(question.uid));

        if (unansweredQuestions.length > 0) {
            const randomQuestionIndex = Math.floor(Math.random() * unansweredQuestions.length);
            const questionData = unansweredQuestions[randomQuestionIndex];

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

    try {
        // The grant list MUST be the return value of the transaction callback, never an outer closure
        // array - a retried-then-discarded run would otherwise surface phantom grants (phantom toasts).
        const grants = await db.runTransaction(async (transaction) => {
            // Re-read the user transactionally FIRST (before any write) so concurrent same-user awards
            // serialize - see readUserInTransaction. Shadows the pre-transaction snapshot above.
            const user = await readUserInTransaction(transaction, userRef);

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
            });

            //Update card collectedBy
            transaction.update<CardCollectedBy, CardCollectedBy>(cardRef, {
                [`collectedBy.${uid}`]: {
                    username: user.username,
                    collectedAt: FieldValue.serverTimestamp()
                }
            } as UpdateData<CardCollectedBy>);

            //Questions
            if (question) {
                //Save that user tried to answer this question
                transaction.update<CollectedQuestions, CollectedQuestions>(collectedQuestionsRef, ({
                    [question.uid]: {
                        answer: null,
                        correct: false,
                        value: 0,
                        collectedAt: FieldValue.serverTimestamp()
                    } as CollectedCardQuestion
                }) as UpdateData<CollectedQuestions>);
            }

            return await awardPoints(db, transaction, userRef, user, card.value, {amountOfCollectedCards: 1});
        });

        logger.log('collectCardHandle', user.username, `card code ${codeAttempt} is valid`);
        return {
            card: (await collectedCardRef.get()).data() as CollectedCard,
            question: question as PublicQuestion,
            achievements: grants
        };
    } catch (error) {
        logger.error('collectCardHandle', 'error while collecting card: ' + error);
        throw new HttpsError('aborted', 'error while collecting card');
    }
});
