import { initializeApp } from 'firebase-admin/app';
import { onCall } from 'firebase-functions/v2/https';
import collectCardHandle from './collectCardHandle';
import seedDatabaseHandle from './seedDatabaseHandle';

initializeApp();

exports.collectcard = onCall(collectCardHandle);

exports.seeddatabase = onCall(seedDatabaseHandle);

