import {FieldValue, getFirestore, Timestamp, UpdateData} from 'firebase-admin/firestore';
import {CompletedPin, Pin, PinCompletedBy, PinType} from './types/pin';
import {CollectedCardQuestion, CollectedQuestions, PublicQuestion, Question, QuestionsDoc} from './types/question';
import getCurrentUser from './actions/getCurrentUser';
import awardPoints from './actions/awardPoints';
import {HttpsError, onCall} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

const normalize = (s: string): string => s.trim().toUpperCase();

export const completePinHandle = onCall(async (req): Promise<{
    pin: CompletedPin,
    question: PublicQuestion | null
}> => {
    const data = req.data;
    const auth = req.auth;
    if (!auth || !auth.uid) {
        logger.error('completePinHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    const uid: string = auth.uid;
    const pinUid: string | null = typeof data.pinUid === 'string' ? data.pinUid : null;
    const codeAttempt: string | null = typeof data.code === 'string' ? data.code : null;
    const answerAttempt: string | null = typeof data.answer === 'string' ? data.answer : null;

    const db = getFirestore();
    const [userRef, user] = await getCurrentUser(db, uid);

    let pinRef: FirebaseFirestore.DocumentReference;
    let pin: Pin;

    if (pinUid) {
        // Pin-UI path (map): the pin is already known, validate against THAT pin's code only.
        pinRef = db.collection('pins').doc(pinUid);
        const pinDoc = await pinRef.get();

        if (!pinDoc.exists) {
            logger.error('completePinHandle', 'pin uid is invalid', pinUid);
            throw new HttpsError('not-found', 'pin uid is invalid');
        }

        pin = pinDoc.data() as Pin;

        if (pin.type === PinType.FEEDBACK || pin.type === PinType.PHOTO) {
            logger.error('completePinHandle', 'pin type is not supported yet', pin.type);
            throw new HttpsError('invalid-argument', 'pin type is not supported yet');
        }

        if (!pin.isActive) {
            logger.error('completePinHandle', 'pin is not active');
            throw new HttpsError('not-found', 'pin is not active');
        }

        assertPinIsAvailable(pin);
        assertPinIsNotAlreadyCompleted(pin, uid);

        if (pin.type !== PinType.VISIT) {
            if (answerAttempt === null || pin.code === null || normalize(answerAttempt) !== normalize(pin.code)) {
                logger.warn('completePinHandle', 'wrong answer', {pinUid: pin.uid, uid});
                throw new HttpsError('invalid-argument', 'wrong answer');
            }
        }
    } else if (codeAttempt !== null) {
        // Global scanner / manual code input path.
        const normalizedCode = normalize(codeAttempt);

        if (normalizedCode.length !== 10) {
            logger.error('completePinHandle', 'code is invalid');
            throw new HttpsError('invalid-argument', 'code is invalid');
        }

        // type == 'code' is the anti-bruteforce rule: a riddle's `code` holds a guessable
        // free-text answer, so a cross-pin lookup would let players solve riddles they never found.
        const pinSnapshot = await db.collection('pins')
            .where('code', '==', normalizedCode)
            .where('type', '==', PinType.CODE)
            .where('isActive', '==', true)
            .get();

        if (pinSnapshot.empty) {
            logger.error('completePinHandle', 'pin code is invalid', codeAttempt);
            throw new HttpsError('not-found', 'pin code is invalid');
        }

        const pinDoc = pinSnapshot.docs[0];
        pinRef = pinDoc.ref;
        pin = pinDoc.data() as Pin;

        assertPinIsAvailable(pin);
        assertPinIsNotAlreadyCompleted(pin, uid);
    } else {
        logger.error('completePinHandle', 'pinUid or code is null');
        throw new HttpsError('invalid-argument', 'pinUid or code is null');
    }

    // Question
    let question: PublicQuestion | null = null;
    const questionsRef: FirebaseFirestore.DocumentReference = db.collection('questions')
        .doc('questions');

    const collectedQuestionsRef: FirebaseFirestore.DocumentReference = db.collection('users')
        .doc(uid)
        .collection('collectedQuestions')
        .doc('collectedQuestions');

    if (pin.withQuestion) {
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

    // Complete the pin
    const completedPinRef = userRef.collection('completedPins')
        .doc(pin.uid);

    try {
        await db.runTransaction(async (transaction) => {
            // Complete pin
            transaction.create(completedPinRef, {
                uid: pin.uid,
                name: pin.name,
                description: pin.description,
                value: pin.value,
                type: pin.type,
                completedAt: FieldValue.serverTimestamp(),
                awardedPoints: pin.value,
                talkName: null,
                rating: null
            });

            // Update pin completedBy
            transaction.update<PinCompletedBy, PinCompletedBy>(pinRef, {
                [`completedBy.${uid}`]: {
                    username: user.username,
                    completedAt: FieldValue.serverTimestamp()
                }
            } as UpdateData<PinCompletedBy>);

            // Questions
            if (question) {
                // Save that user tried to answer this question
                transaction.update<CollectedQuestions, CollectedQuestions>(collectedQuestionsRef, ({
                    [question.uid]: {
                        answer: null,
                        correct: false,
                        value: 0,
                        collectedAt: FieldValue.serverTimestamp()
                    } as CollectedCardQuestion
                }) as UpdateData<CollectedQuestions>);
            }

            await awardPoints(db, transaction, userRef, user, pin.value, {amountOfCompletedPins: 1});
        });

        logger.log('completePinHandle', user.username, `pin ${pin.uid} completed`);
        return {
            pin: (await completedPinRef.get()).data() as CompletedPin,
            question: question as PublicQuestion
        };
    } catch (error) {
        logger.error('completePinHandle', 'error while completing pin: ' + error);
        throw new HttpsError('aborted', 'error while completing pin');
    }
});

function assertPinIsAvailable(pin: Pin): void {
    const now = Date.now();

    if (pin.availableFrom && (pin.availableFrom as Timestamp).toDate().getTime() > now) {
        logger.error('completePinHandle', 'pin is not available yet', pin.uid);
        throw new HttpsError('failed-precondition', 'pin is not available yet');
    }

    if (pin.availableTo && (pin.availableTo as Timestamp).toDate().getTime() < now) {
        logger.error('completePinHandle', 'pin is no longer available', pin.uid);
        throw new HttpsError('failed-precondition', 'pin is no longer available');
    }
}

function assertPinIsNotAlreadyCompleted(pin: Pin, uid: string): void {
    const isAlreadyCompleted = pin.completedBy && uid in pin.completedBy;

    if (isAlreadyCompleted) {
        logger.error('completePinHandle', 'pin is already completed');
        throw new HttpsError('already-exists', 'pin is already completed');
    }
}
