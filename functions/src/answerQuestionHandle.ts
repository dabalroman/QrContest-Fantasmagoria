import * as logger from 'firebase-functions/logger';
import {HttpsError} from 'firebase-functions/v2/https';
import {DocumentReference, FieldValue, getFirestore, UpdateData} from 'firebase-admin/firestore';
import {CollectedQuestions, Question, QuestionAnswerValue, QuestionsDoc} from './types/question';
import updateRanking from './actions/updateRanking';
import getCurrentUser from './actions/getCurrentUser';
import updateGuild from './actions/updateGuild';
import {onCall} from "firebase-functions/https";

export const answerQuestionHandle = onCall(async (req): Promise<{
    correct: boolean,
    correctAnswer: QuestionAnswerValue
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

    const questionsRef: FirebaseFirestore.DocumentReference = await db.collection('questions')
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

    user.score += questionValue;
    user.amountOfAnsweredQuestions += 1;

    try {
        await db.runTransaction(async (transaction) => {
            //Update user score and amount of collected cards
            transaction.update(userRef, {
                score: FieldValue.increment(questionValue),
                amountOfAnsweredQuestions: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp()
            });

            //Save user answered question
            transaction.update<CollectedQuestions, CollectedQuestions>(collectedQuestionsRef, {
                [questionUid]: {
                    answer: questionAnswer,
                    correct: questionCorrect,
                    value: questionValue,
                    collectedAt: FieldValue.serverTimestamp()
                }
            } as UpdateData<CollectedQuestions>);

            await updateRanking(db, transaction, user);
            await updateGuild(db, transaction, user);
        });

        logger.log('answerQuestionHandle', user.username, `question answer ${questionUid} registered`);
        return {
            correct: questionCorrect,
            correctAnswer: questionCorrectAnswer
        };
    } catch (error) {
        logger.error('answerQuestionHandle', 'error while answering the question: ' + error);
        throw new HttpsError('aborted', 'error while answering the question');
    }
});
