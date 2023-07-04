import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import seedDatabaseHandle from './seedDatabaseHandle';
import answerQuestionHandle from './answerQuestionHandle';
import collectCardHandle from './collectCardHandle';
import setupAccountHandle from './setupAccountHandle';

admin.initializeApp();

exports.collectcard =
    functions.region('europe-west1')
        .https
        .onCall(collectCardHandle);

exports.answerquestion =
    functions.region('europe-west1')
        .https
        .onCall(answerQuestionHandle);

exports.setupaccount =
    functions.region('europe-west1')
        .https
        .onCall(setupAccountHandle);

exports.seeddatabase =
    functions.region('europe-west1')
        .https
        .onCall(seedDatabaseHandle);
