import { HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { Timestamp } from 'firebase-admin/firestore';
import { Pin } from '../types/pin';

// Shared pin guards, extracted verbatim from collectPinHandle so submitPhotoHandle (#19) reuses the
// EXACT same validation - a photo submit must reject an inactive/unavailable/already-collected pin the
// same way a collect does. The HttpsError messages are unchanged (the e2e suite matches on them).

export function assertPinIsActive(pin: Pin): void {
    if (!pin.isActive) {
        logger.error('assertPin', 'pin is not active', pin.uid);
        throw new HttpsError('not-found', 'pin is not active');
    }
}

export function assertPinIsAvailable(pin: Pin): void {
    const now = Date.now();

    if (pin.availableFrom && (pin.availableFrom as Timestamp).toDate().getTime() > now) {
        logger.error('assertPin', 'pin is not available yet', pin.uid);
        throw new HttpsError('failed-precondition', 'pin is not available yet');
    }

    if (pin.availableTo && (pin.availableTo as Timestamp).toDate().getTime() < now) {
        logger.error('assertPin', 'pin is no longer available', pin.uid);
        throw new HttpsError('failed-precondition', 'pin is no longer available');
    }
}

export function assertPinIsNotAlreadyCollected(pin: Pin, uid: string): void {
    const isAlreadyCollected = pin.collectedBy && uid in pin.collectedBy;

    if (isAlreadyCollected) {
        logger.error('assertPin', 'pin is already collected');
        throw new HttpsError('already-exists', 'pin is already collected');
    }
}
