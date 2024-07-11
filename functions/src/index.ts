import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import seedDatabaseHandle from './seedDatabaseHandle';
import answerQuestionHandle from './answerQuestionHandle';
import collectCardHandle from './collectCardHandle';
import setupAccountHandle from './setupAccountHandle';
import joinGuildHandle from './joinGuildHandle';
import updateRoundsProcessor from './updateRoundsProcessor';

const region = 'europe-west1';

admin.initializeApp();

exports.collectcard =
    functions.region(region)
        .https
        .onCall(collectCardHandle);

exports.answerquestion =
    functions.region(region)
        .https
        .onCall(answerQuestionHandle);

exports.setupaccount =
    functions.region(region)
        .https
        .onCall(setupAccountHandle);

exports.seeddatabase =
    functions.region(region)
        .https
        .onCall(seedDatabaseHandle);

exports.joinguild =
    functions.region(region)
        .https
        .onCall(joinGuildHandle);

exports.updaterounds =
    functions.region(region)
        .https
        .onCall(async (data, context) => {
            const result = await updateRoundsProcessor();
            return { result };
        });

exports.autoUpdateRounds =
    functions.region(region)
        .pubsub
        .schedule('0 * * * *')
        .onRun(async (context) => {
            await updateRoundsProcessor();
        });
