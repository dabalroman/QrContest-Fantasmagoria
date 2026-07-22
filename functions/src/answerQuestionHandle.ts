import * as logger from 'firebase-functions/logger';
import {HttpsError} from 'firebase-functions/v2/https';
import {DocumentReference, FieldValue, getFirestore, UpdateData} from 'firebase-admin/firestore';
import {CollectedQuestions, Question, QuestionAnswerValue, QuestionsDoc} from './types/question';
import getCurrentUser, { readUserInTransaction } from './actions/getCurrentUser';
import awardPoints from './actions/awardPoints';
import {AchievementGrant} from './types/achievement';
import {onCall} from "firebase-functions/https";

export const answerQuestionHandle = onCall(async (req): Promise<{
    correct: boolean,
    correctAnswer: QuestionAnswerValue,
    achievements: AchievementGrant[]
}> => {
    const data = req.data;
    const auth = req.auth;

    if (!auth || !auth.uid) {
        logger.error('collectCardHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const uid: string = auth.uid;
    const questionUid: string | any = data.uid;
    const questionAnswer: string | any = data.answer;

    if (typeof questionUid !== 'string' || typeof questionAnswer !== 'string' || questionAnswer.length !== 1) {
        logger.error('answerQuestionHandle', 'uid or code is null');
        throw new HttpsError('invalid-argument', 'uid or code is null');
    }

    // Does user exist?
    const db = getFirestore();
    const [userRef, user] = await getCurrentUser(db, uid);

    const collectedQuestionsRef: FirebaseFirestore.DocumentReference = db.collection('users')
        .doc(uid)
        .collection('collectedQuestions')
        .doc('collectedQuestions') as DocumentReference<CollectedQuestions, CollectedQuestions>;

    try {
        const collectedQuestionsDoc = await collectedQuestionsRef.get();
        const collectedQuestions = collectedQuestionsDoc.data() as CollectedQuestions;

        if (!collectedQuestions[questionUid] || collectedQuestions[questionUid].answer !== null) {
            throw new Error();
        }
    } catch (error) {
        logger.error('answerQuestionHandle', 'error while getting collected questions: ' + error);
        throw new HttpsError('aborted', 'error while getting collected questions');
    }

    const questionsRef: FirebaseFirestore.DocumentReference = db.collection('questions')
        .doc('questions');
    const questionsDoc = await questionsRef.get();
    const questionsData = questionsDoc.data() as QuestionsDoc;
    const questions = Object.values(questionsData) as Question[];
    const question = questions.find((question) => question.uid === questionUid);

    if (!question) {
        logger.error('answerQuestionHandle', 'unknown question');
        throw new HttpsError('invalid-argument', 'unknown question');
    }

    const questionCorrectAnswer = question.correct;
    const questionCorrect = questionCorrectAnswer === questionAnswer;
    const questionValue = questionCorrect ? question.value : 0;

    try {
        // The grant list MUST be the return value of the transaction callback, never an outer closure
        // array - a retried-then-discarded run would otherwise surface phantom grants (phantom toasts).
        const grants = await db.runTransaction(async (transaction) => {
            // Re-assert "not yet answered" TRANSACTIONALLY. The pre-transaction check above cannot hold:
            // the write below is a plain update on an existing doc, so it carries no precondition of its
            // own (unlike collectPinHandle, whose transaction.create throws ALREADY_EXISTS). Without this
            // read putting the doc in the read-set, two near-simultaneous answers to the same question
            // both pass the pre-check and both commit - double score and double counters, no self-heal.
            const freshCollectedQuestions = (await transaction.get(collectedQuestionsRef))
                .data() as CollectedQuestions;

            if (!freshCollectedQuestions?.[questionUid] || freshCollectedQuestions[questionUid].answer !== null) {
                logger.warn('answerQuestionHandle', 'question is already answered', {questionUid, uid});
                throw new HttpsError('failed-precondition', 'question is already answered');
            }

            // Both reads precede every write below - the read-set on the user doc serializes concurrent
            // same-user awards (see readUserInTransaction). Shadows the pre-transaction snapshot above.
            const user = await readUserInTransaction(transaction, userRef);

            //Save user answered question
            transaction.update<CollectedQuestions, CollectedQuestions>(collectedQuestionsRef, {
                [questionUid]: {
                    answer: questionAnswer,
                    correct: questionCorrect,
                    value: questionValue,
                    collectedAt: FieldValue.serverTimestamp()
                }
            } as UpdateData<CollectedQuestions>);

            return await awardPoints(db, transaction, userRef, user, questionValue, {
                amountOfAnsweredQuestions: 1,
                amountOfCorrectAnswers: questionCorrect ? 1 : 0
            });
        });

        logger.log('answerQuestionHandle', user.username, `question answer ${questionUid} registered`);
        return {
            correct: questionCorrect,
            correctAnswer: questionCorrectAnswer,
            achievements: grants
        };
    } catch (error) {
        if (error instanceof HttpsError) {
            throw error;
        }
        logger.error('answerQuestionHandle', 'error while answering the question: ' + error);
        throw new HttpsError('aborted', 'error while answering the question');
    }
});
