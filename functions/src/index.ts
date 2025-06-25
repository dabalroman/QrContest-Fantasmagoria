import {setGlobalOptions} from "firebase-functions/v2";
setGlobalOptions({region: 'europe-west1'});

import * as admin from 'firebase-admin';
admin.initializeApp();

import {setupAccountHandle} from './setupAccountHandle';
import {seedDatabaseHandle} from './seedDatabaseHandle';
import {collectCardHandle} from './collectCardHandle';
import {answerQuestionHandle} from './answerQuestionHandle';
import {joinGuildHandle} from './joinGuildHandle';
import {onSchedule} from "firebase-functions/scheduler";
import {logger} from "firebase-functions";
import updateRoundsProcessor from "./updateRoundsProcessor";
import {onCall} from "firebase-functions/https";

export {setupAccountHandle, seedDatabaseHandle, collectCardHandle, answerQuestionHandle, joinGuildHandle};

export const updateRoundsHandle = onCall(async (): Promise<{}> => {
    const result = await updateRoundsProcessor();
    return { result };
});

export const autoUpdateRounds = onSchedule("0 * * * *", async () => {
    logger.info("Automatic update rounds");
    await updateRoundsProcessor();
});