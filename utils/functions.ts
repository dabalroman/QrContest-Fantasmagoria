import { HttpsCallable, httpsCallable } from '@firebase/functions';
import { functions } from '@/utils/firebase';
import {
    RawAchievementGrant, RawCard, RawCollectedPin, RawPin, RawPinAuthoredFields, RawQuestion
} from '@/models/Raw';
import { QuestionAnswerValue } from '@/functions/src/types/question';

export const collectCardFunction: HttpsCallable<
    { code: string },
    { card: RawCard, question: RawQuestion | null, achievements: RawAchievementGrant[] }
> = httpsCallable(functions, 'collectCardHandle');

export const collectPinFunction: HttpsCallable<
    { code?: string, pinUid?: string, answer?: string },
    { pin: RawCollectedPin, question: RawQuestion | null, achievements: RawAchievementGrant[] }
> = httpsCallable(functions, 'collectPinHandle');

// Read-only: the map's pin feed. Returns PublicPins (code + collectedBy stripped server-side).
export const getPinsFunction: HttpsCallable<
    {},
    { pins: RawPin[] }
> = httpsCallable(functions, 'getPinsHandle');

// Admin-only: create/update a pin from the map-native editor (#14). Always the complete authored
// field set, never a partial patch. Returns the same PublicPin shape getPins does.
export const upsertPinFunction: HttpsCallable<
    { pinUid: string | null, fields: RawPinAuthoredFields },
    { pin: RawPin }
> = httpsCallable(functions, 'upsertPinHandle');

// Admin-only: delete a pin from the map-native editor (#14). Not transactional — no invariant to protect.
export const deletePinFunction: HttpsCallable<
    { pinUid: string },
    { status: string }
> = httpsCallable(functions, 'deletePinHandle');

export const answerQuestionFunction: HttpsCallable<
    { uid: string, answer: string },
    { correct: boolean, correctAnswer: QuestionAnswerValue, achievements: RawAchievementGrant[] }
> = httpsCallable(functions, 'answerQuestionHandle');

export const setupAccountFunction: HttpsCallable<
    { username: string },
    {}
> = httpsCallable(functions, 'setupAccountHandle');

export const joinGuildFunction: HttpsCallable<
    { guild: string },
    {}
> = httpsCallable(functions, 'joinGuildHandle');

export const seedDatabaseFunction: HttpsCallable<
    { password: string },
    {}
> = httpsCallable(functions, 'seedDatabaseHandle');

export const updateRoundsFunction: HttpsCallable<
    {},
    { result: string }
> = httpsCallable(functions, 'updateRoundsHandle');
