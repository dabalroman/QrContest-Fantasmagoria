import { initializeApp } from 'firebase-admin/app';
import { onCall } from 'firebase-functions/v2/https';
import collectCardHandle from './collectCardHandle';
import seedDatabaseHandle from './seedDatabaseHandle';
import answerQuestionHandle from './answerQuestionHandle';
import setupAccountHandle from './setupAccountHandle';

initializeApp();

exports.collectcard = onCall(collectCardHandle);
exports.answerquestion = onCall(answerQuestionHandle);
exports.setupaccount = onCall(setupAccountHandle);

exports.seeddatabase = onCall(seedDatabaseHandle);

