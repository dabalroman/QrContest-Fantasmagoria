import {FieldValue, getFirestore, UpdateData} from 'firebase-admin/firestore';
import {CollectedPin, Pin, PinCollectedBy, PinType} from './types/pin';
import {CollectedCardQuestion, CollectedQuestions, PublicQuestion, Question, QuestionsDoc} from './types/question';
import getCurrentUser, { readUserInTransaction } from './actions/getCurrentUser';
import awardPoints from './actions/awardPoints';
import scopeKeys from './actions/pinScopeKeys';
import { assertPinIsActive, assertPinIsAvailable, assertPinIsNotAlreadyCollected } from './actions/assertPin';
import {AchievementGrant} from './types/achievement';
import {HttpsError, onCall} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import forbiddenPhrases from './data/forbiddenPhrases';

const normalize = (s: string): string => s.trim().toUpperCase();

const MIN_TALK_NAME_LENGTH = 10;
const MAX_TALK_NAME_LENGTH = 255;

function checkForForbiddenPhrases(text: string): boolean {
    const lower = text.toLowerCase();
    return forbiddenPhrases.some((phrase) => lower.includes(phrase));
}

function validateFeedback(ratingRaw: unknown, talkNameRaw: unknown): { rating: number, talkName: string } {
    if (typeof ratingRaw !== 'number' || !Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
        logger.error('collectPinHandle', 'rating is invalid', ratingRaw);
        throw new HttpsError('invalid-argument', 'rating is invalid');
    }

    if (typeof talkNameRaw !== 'string') {
        logger.error('collectPinHandle', 'talkName is invalid');
        throw new HttpsError('invalid-argument', 'talkName is invalid');
    }

    const talkName = talkNameRaw.trim();

    if (talkName.length < MIN_TALK_NAME_LENGTH
        || talkName.length > MAX_TALK_NAME_LENGTH
        || checkForForbiddenPhrases(talkName)) {
        logger.error('collectPinHandle', 'talkName is invalid');
        throw new HttpsError('invalid-argument', 'talkName is invalid');
    }

    return { rating: ratingRaw, talkName };
}

export const collectPinHandle = onCall(async (req): Promise<{
    pin: CollectedPin,
    question: PublicQuestion | null,
    achievements: AchievementGrant[]
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
    let feedback: { rating: number, talkName: string } | null = null;

    if (pinUid) {
        // Pin-UI path (map): the pin is already known, validate against THAT pin's code only.
        pinRef = db.collection('pins').doc(pinUid);
        const pinDoc = await pinRef.get();

        if (!pinDoc.exists) {
            logger.error('collectPinHandle', 'pin uid is invalid', pinUid);
            throw new HttpsError('not-found', 'pin uid is invalid');
        }

        pin = pinDoc.data() as Pin;
        const isFeedback = pin.type === PinType.FEEDBACK;

        // Photo pins go through submitPhotoHandle - they award nothing until an admin approves.
        if (pin.type === PinType.PHOTO) {
            logger.error('collectPinHandle', 'pin type is not supported yet', pin.type);
            throw new HttpsError('invalid-argument', 'pin type is not supported yet');
        }

        assertPinIsActive(pin);
        assertPinIsAvailable(pin);
        assertPinIsNotAlreadyCollected(pin, uid);

        if (isFeedback) {
            feedback = validateFeedback(data.rating, data.talkName);
        } else if (pin.type !== PinType.VISIT) {
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

        // The type filter is the anti-bruteforce rule: a riddle's `code` holds a guessable free-text
        // answer, so a cross-pin lookup would let players solve riddles they never found. GHOST and
        // GEOCACHING join CODE here because every one of their codes is a 10-char [A-Z0-9] string like a
        // printed one, so the length check above already covers them - the surfaces that carry such a
        // code tell readers to type it in, and this is the input they type it into.
        // isActive is NOT queried here (decision 28): an inactive pin must report 'pin is not active',
        // the same as the pin-UI path, rather than the misleading 'pin code is invalid'.
        const pinSnapshot = await db.collection('pins')
            .where('code', '==', normalizedCode)
            .where('type', 'in', [PinType.CODE, PinType.GHOST, PinType.GEOCACHING])
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

    if (pin.withQuestion && pin.type !== PinType.FEEDBACK) {
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
        // The grant list MUST be the return value of the transaction callback, never an outer closure
        // array - a retried-then-discarded run would otherwise surface phantom grants (phantom toasts).
        const grants = await db.runTransaction(async (transaction) => {
            // Re-read the user transactionally FIRST (before any write) so concurrent same-user awards
            // serialize - see readUserInTransaction. Shadows the pre-transaction snapshot above.
            const user = await readUserInTransaction(transaction, userRef);

            // Collect pin
            transaction.create(collectedPinRef, {
                uid: pin.uid,
                name: pin.name,
                description: pin.description,
                value: pin.value,
                type: pin.type,
                collectedAt: FieldValue.serverTimestamp(),
                awardedPoints: pin.value
            });

            // Update pin collectedBy
            transaction.update<PinCollectedBy, PinCollectedBy>(pinRef, {
                [`collectedBy.${uid}`]: {
                    username: user.username,
                    collectedAt: FieldValue.serverTimestamp(),
                    ...(feedback ? { rating: feedback.rating, talkName: feedback.talkName } : {})
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

            return await awardPoints(
                db, transaction, userRef, user, pin.value, {amountOfCollectedPins: 1}, scopeKeys(pin)
            );
        });

        logger.log('collectPinHandle', user.username, `pin ${pin.uid} collected`);
        return {
            pin: (await collectedPinRef.get()).data() as CollectedPin,
            question: question as PublicQuestion,
            achievements: grants
        };
    } catch (error) {
        logger.error('collectPinHandle', 'error while collecting pin: ' + error);
        throw new HttpsError('aborted', 'error while collecting pin');
    }
});
