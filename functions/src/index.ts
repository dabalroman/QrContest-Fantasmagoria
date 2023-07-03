import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import seedDatabaseHandle from './seedDatabaseHandle';

admin.initializeApp();

// exports.collectcard = onCall(collectCardHandle);
// exports.answerquestion = onCall(answerQuestionHandle);
// exports.setupaccount = functions.region('europe-west1').https.onCall(setupAccountHandle);
exports.seeddatabase =
    functions.region('europe-west1')
        .https
        .onCall(seedDatabaseHandle);
