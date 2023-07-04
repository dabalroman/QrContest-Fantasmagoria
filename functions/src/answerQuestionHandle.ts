import { https, logger } from 'firebase-functions';
import { HttpsError } from 'firebase-functions/v2/https';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { CollectedQuestions, Question, QuestionAnswerValue } from './types/question';
import getRankingUpdateArray from './actions/getRankingUpdateArray';
import getCurrentUser from './actions/getCurrentUser';

export default async function answerQuestionHandle (
    data: any,
    context: https.CallableContext
): Promise<{ correct: boolean, correctAnswer: QuestionAnswerValue }> {
    if (!context.auth || !context.auth.uid) {
        logger.error('collectCardHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    // Does request looks right?
    const uid: string = context.auth.uid;
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
        .doc('collectedQuestions');

    try {
        const collectedQuestionsDoc = await collectedQuestionsRef.get();
        const collectedQuestions = collectedQuestionsDoc.data() as CollectedQuestions;

        logger.log(collectedQuestions);

        if (!collectedQuestions[questionUid] || collectedQuestions[questionUid].answer !== null) {
            throw new Error();
        }
    } catch (error) {
        logger.error('answerQuestionHandle', 'error while getting collected questions: ' + error);
        throw new HttpsError('aborted', 'error while getting collected questions');
    }

    const questionDoc = (await db.collection('questions')
        .doc(questionUid)
        .get()).data() as Question;
    const questionCorrectAnswer = questionDoc.correct;
    const questionCorrect = questionCorrectAnswer === questionAnswer;
    const questionValue = questionCorrect ? questionDoc.value : 0;

    user.score += questionValue;
    user.amountOfAnsweredQuestions += 1;

    const rankingUpdateArray = await getRankingUpdateArray(db, user);

    try {
        await db.runTransaction(async (transaction) => {
            //Update user score and amount of collected cards
            transaction.update(userRef, {
                score: user.score,
                amountOfAnsweredQuestions: user.amountOfAnsweredQuestions,
                updatedAt: FieldValue.serverTimestamp()
            });

            //Update ranking
            rankingUpdateArray.forEach((rankingRound) => {
                transaction.set(rankingRound.ref, rankingRound.round, { merge: true });
            });

            //Save user answered question
            transaction.set(collectedQuestionsRef, {
                [questionUid]: {
                    answer: questionAnswer,
                    correct: questionCorrect,
                    value: questionValue,
                    collectedAt: FieldValue.serverTimestamp()
                }
            }, { merge: true });
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
};
