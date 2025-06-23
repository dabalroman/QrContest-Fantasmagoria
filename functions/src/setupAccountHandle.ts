import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import {FieldValue, getFirestore, DocumentData, DocumentReference} from 'firebase-admin/firestore';
import {User, UserRole, UserUsername} from './types/user';
import updateRanking from './actions/updateRanking';
import forbiddenPhrases from './data/forbiddenPhrases';

function checkForForbiddenPhrases(username: string): boolean {
    const text = username.toLowerCase();
    return forbiddenPhrases.some((phrase) => text.includes(phrase));
}

export const setupAccountHandle = onCall(async (req): Promise<{ user: User }> => {
    const data = req.data;
    const auth = req.auth;

    if (!auth || !auth.uid) {
        logger.error('setupAccountHandle', 'permission denied');
        throw new HttpsError('permission-denied', 'permission denied');
    }

    // Does username look right?
    const uid: string = auth.uid;
    let username: string | null = data.username.trim() ?? null;

    if (
        typeof username !== 'string'
        || username.length < 3 || username.length > 20
        || username.match(/^[A-z0-9ąćęłóśźż\-\s&$#@.<>(){}:;+]+$/i) === null
    ) {
        logger.error('setupAccountHandle', 'username does not meet requirements');
        throw new HttpsError('invalid-argument', 'username does not meet requirements');
    }

    if (checkForForbiddenPhrases(username)) {
        logger.error('setupAccountHandle', 'username does not meet requirements - bad words');
        throw new HttpsError('invalid-argument', 'username does not meet requirements');
    }

    // Does user exist?
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const userExist = (await userRef.get()).exists;

    if (userExist) {
        logger.error('setupAccountHandle', 'user uid exist already');
        throw new HttpsError('invalid-argument', 'user uid exist already');
    }

    // Is username free to take?
    const usernameRef = db.collection('users-usernames').doc(username) as DocumentReference<UserUsername, UserUsername>;
    const usernameTaken = (await usernameRef.get()).exists;

    if (usernameTaken) {
        logger.error('setupAccountHandle', 'nickname already taken');
        throw new HttpsError('invalid-argument', 'nickname already taken');
    }

    const user: User = {
        uid: uid,
        username: username,
        score: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        role: UserRole.USER,
        memberOf: null,
        winnerInRound: null,
        updatedAt: FieldValue.serverTimestamp(),
        lastGuildChangeAt: new Date('2020/01/01') as any
    };
    
    const userUsername: UserUsername = {
        uid: uid
    };

    let collectedQuestionsRef = db
        .collection('users')
        .doc(uid)
        .collection('collectedQuestions')
        .doc('collectedQuestions');

    try {
        await db.runTransaction(async (transaction) => {
            transaction.create(userRef, user);
            transaction.create<UserUsername, DocumentData>(usernameRef, userUsername);
            transaction.create(collectedQuestionsRef, {});
            await updateRanking(db, transaction, user);
        });

        logger.log('setupAccountHandle', `User ${user.username} registered.`);
        return { user };
    } catch (error) {
        logger.error('setupAccountHandle', 'error while registering the user: ' + error);
        throw new HttpsError('aborted', 'error while registering the user');
    }
});
