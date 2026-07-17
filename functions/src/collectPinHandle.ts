import {FieldValue, getFirestore, Timestamp, UpdateData} from 'firebase-admin/firestore';
import {CollectedPin, Pin, PinCollectedBy, PinType} from './types/pin';
import {CollectedCardQuestion, CollectedQuestions, PublicQuestion, Question, QuestionsDoc} from './types/question';
import getCurrentUser from './actions/getCurrentUser';
import awardPoints from './actions/awardPoints';
import {HttpsError, onCall} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

const normalize = (s: string): string => s.trim().toUpperCase();

export const collectPinHandle = onCall(async (req): Promise<{
    pin: CollectedPin,
    question: PublicQuestion | null
}> => {
    const data = req.data;
    const auth = req.auth;
    if (!auth || !auth.uid) {
        logger.error('collectPinHandle', 'permission denied');
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
            logger.error('collectPinHandle', 'pin uid is invalid', pinUid);
            throw new HttpsError('not-found', 'pin uid is invalid');
        }

        pin = pinDoc.data() as Pin;

        if (pin.type === PinType.FEEDBACK || pin.type === PinType.PHOTO) {
            logger.error('collectPinHandle', 'pin type is not supported yet', pin.type);
            throw new HttpsError('invalid-argument', 'pin type is not supported yet');
        }

        assertPinIsActive(pin);
        assertPinIsAvailable(pin);
        assertPinIsNotAlreadyCollected(pin, uid);

        if (pin.type !== PinType.VISIT) {
            if (answerAttempt === null || pin.code === null || normalize(answerAttempt) !== normalize(pin.code)) {
                logger.warn('collectPinHandle', 'wrong answer', {pinUid: pin.uid, uid});
                throw new HttpsError('invalid-argument', 'wrong answer');
            }
        }
    } else if (codeAttempt !== null) {
        // Global scanner / manual code input path.
        const normalizedCode = normalize(codeAttempt);

        if (normalizedCode.length !== 10) {
            logger.error('collectPinHandle', 'code is invalid');
            throw new HttpsError('invalid-argument', 'code is invalid');
        }

        // type == 'code' is the anti-bruteforce rule: a riddle's `code` holds a guessable
        // free-text answer, so a cross-pin lookup would let players solve riddles they never found.
        // isActive is NOT queried here (decision 28): an inactive pin must report 'pin is not active',
        // the same as the pin-UI path, rather than the misleading 'pin code is invalid'.
        const pinSnapshot = await db.collection('pins')
            .where('code', '==', normalizedCode)
            .where('type', '==', PinType.CODE)
            .get();

        if (pinSnapshot.empty) {
            logger.error('collectPinHandle', 'pin code is invalid', codeAttempt);
            throw new HttpsError('not-found', 'pin code is invalid');
        }

        const pinDoc = pinSnapshot.docs[0];
        pinRef = pinDoc.ref;
        pin = pinDoc.data() as Pin;

        assertPinIsActive(pin);
        assertPinIsAvailable(pin);
        assertPinIsNotAlreadyCollected(pin, uid);
    } else {
        logger.error('collectPinHandle', 'pinUid or code is null');
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

    // Collect the pin
    const collectedPinRef = userRef.collection('collectedPins')
        .doc(pin.uid);

    try {
        await db.runTransaction(async (transaction) => {
            // Collect pin
            transaction.create(collectedPinRef, {
                uid: pin.uid,
                name: pin.name,
                description: pin.description,
                value: pin.value,
                type: pin.type,
                collectedAt: FieldValue.serverTimestamp(),
                awardedPoints: pin.value,
                talkName: null,
                rating: null
            });

            // Update pin collectedBy
            transaction.update<PinCollectedBy, PinCollectedBy>(pinRef, {
                [`collectedBy.${uid}`]: {
                    username: user.username,
                    collectedAt: FieldValue.serverTimestamp()
                }
            } as UpdateData<PinCollectedBy>);

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

            await awardPoints(db, transaction, userRef, user, pin.value, {amountOfCollectedPins: 1});
        });

        logger.log('collectPinHandle', user.username, `pin ${pin.uid} collected`);
        return {
            pin: (await collectedPinRef.get()).data() as CollectedPin,
            question: question as PublicQuestion
        };
    } catch (error) {
        logger.error('collectPinHandle', 'error while collecting pin: ' + error);
        throw new HttpsError('aborted', 'error while collecting pin');
    }
});

function assertPinIsActive(pin: Pin): void {
    if (!pin.isActive) {
        logger.error('collectPinHandle', 'pin is not active', pin.uid);
        throw new HttpsError('not-found', 'pin is not active');
    }
}

function assertPinIsAvailable(pin: Pin): void {
    const now = Date.now();

    if (pin.availableFrom && (pin.availableFrom as Timestamp).toDate().getTime() > now) {
        logger.error('collectPinHandle', 'pin is not available yet', pin.uid);
        throw new HttpsError('failed-precondition', 'pin is not available yet');
    }

    if (pin.availableTo && (pin.availableTo as Timestamp).toDate().getTime() < now) {
        logger.error('collectPinHandle', 'pin is no longer available', pin.uid);
        throw new HttpsError('failed-precondition', 'pin is no longer available');
    }
}

function assertPinIsNotAlreadyCollected(pin: Pin, uid: string): void {
    const isAlreadyCollected = pin.collectedBy && uid in pin.collectedBy;

    if (isAlreadyCollected) {
        logger.error('collectPinHandle', 'pin is already collected');
        throw new HttpsError('already-exists', 'pin is already collected');
    }
}
