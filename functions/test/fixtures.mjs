// Minimal deterministic fixture seeded straight through the admin SDK — not the real
// 64-card seed. Just enough for the handlers to run: one open ranking round, one guild,
// one collectible card that carries a question, and the questions doc.

import admin from 'firebase-admin';
import { db } from './emulator.mjs';

const { Timestamp, FieldValue } = admin.firestore;

export const CARD_CODE = 'TESTCODE01';        // 10 chars, [A-Z0-9]
export const CARD_VALUE = 10;                 // common tier
export const GUILD_UID = 'guild-steel';
export const ROUND_UID = '1';
export const QUESTION_UID = 'test-question';
export const QUESTION_VALUE = 15;
export const QUESTION_CORRECT = 'a';

/** Total score a user should have after collect (+10) then a correct answer (+15). */
export const EXPECTED_TOTAL = CARD_VALUE + QUESTION_VALUE;

// --- Pins ---
export const PIN_CODE_UID = 'test-pin-code';
export const PIN_CODE_VALUE = 20;
export const PIN_CODE_CODE = 'PINCODE001';     // 10 chars, [A-Z0-9]
export const PIN_CODE_NAME = 'Test pin (code)';
export const PIN_CODE_DESCRIPTION = 'test pin';
export const PIN_CODE_HINT_RADIUS = 120;       // getPins must carry this through (decision 26)

export const PIN_RIDDLE_UID = 'test-pin-riddle';
export const PIN_RIDDLE_VALUE = 15;
export const PIN_RIDDLE_ANSWER = 'smok';       // free-text, matched case/whitespace-insensitively

export const PIN_VISIT_UID = 'test-pin-visit';
export const PIN_VISIT_VALUE = 5;

export const PIN_FEEDBACK_UID = 'test-pin-feedback';
export const PIN_PHOTO_UID = 'test-pin-photo';

export const PIN_UNAVAILABLE_UID = 'test-pin-unavailable';
export const PIN_UNAVAILABLE_VALUE = 5;

// Inactive code pin — getPins must drop it, and BOTH collect entry paths must report it identically
// as 'pin is not active' (decision 28). There is no inactive pin without this fixture.
export const PIN_INACTIVE_UID = 'test-pin-inactive';
export const PIN_INACTIVE_CODE = 'PININACT01';  // 10 chars, [A-Z0-9]

// Active but outside/inside its window — getPins returns both (window is filtered client-side); these
// pin the timestamp-round-trip through Pin.fromRaw (which reads `._seconds`).
export const PIN_FUTURE_UID = 'test-pin-future';
export const PIN_WINDOWED_UID = 'test-pin-windowed';

/**
 * A user doc as it looked before `amountOfCollectedPins` existed — written straight through the
 * admin SDK so it bypasses setupAccountHandle, which would initialize every counter. Mirrors what
 * an account created mid-development actually holds, and re-arms for every counter added later.
 */
export async function seedLegacyUser (uid, username) {
    await db.collection('users').doc(uid).set({
        uid,
        username,
        score: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        // amountOfCollectedPins deliberately absent — that is the whole point of this fixture.
        role: 'user',
        memberOf: null,
        winnerInRound: null,
        updatedAt: FieldValue.serverTimestamp(),
        lastGuildChangeAt: Timestamp.fromDate(new Date('2020/01/01'))
    });

    await db.collection('users-usernames').doc(username).set({ uid });

    // collectCardHandle / collectPinHandle transaction.update this doc — it must exist.
    await db.collection('users').doc(uid)
        .collection('collectedQuestions').doc('collectedQuestions')
        .set({});
}

export async function seedFixture () {
    const now = Date.now();

    // Open round: started an hour ago, ends in a day → updateRanking will write to it.
    await db.collection('ranking').doc(ROUND_UID).set({
        uid: ROUND_UID,
        name: 'pierwsza',
        finished: false,
        from: Timestamp.fromMillis(now - 60 * 60 * 1000),
        to: Timestamp.fromMillis(now + 24 * 60 * 60 * 1000),
        users: {},
        guilds: {}
    });

    await db.collection('guilds').doc(GUILD_UID).set({
        uid: GUILD_UID,
        name: 'Liga graczy',
        description: 'test guild',
        score: 0,
        amountOfMembers: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        members: {},
        updatedAt: FieldValue.serverTimestamp()
    });

    await db.collection('cards').doc(CARD_CODE).set({
        uid: CARD_CODE,
        cardSet: 'test-set',
        code: CARD_CODE,
        collectedBy: {},
        description: 'test card',
        image: 'test',
        isActive: true,
        comment: '',
        name: 'Test Card',
        tier: 'common',
        value: CARD_VALUE,
        withQuestion: true
    });

    await db.collection('questions').doc('questions').set({
        [QUESTION_UID]: {
            uid: QUESTION_UID,
            question: 'Test question?',
            answers: { a: 'right', b: 'wrong', c: 'wrong', d: 'wrong' },
            correct: QUESTION_CORRECT,
            value: QUESTION_VALUE,
            updatedAt: FieldValue.serverTimestamp()
        }
    });

    await db.collection('pins').doc(PIN_CODE_UID).set({
        uid: PIN_CODE_UID,
        name: PIN_CODE_NAME,
        description: PIN_CODE_DESCRIPTION,
        clue: '',
        type: 'code',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 0, y: 0 },
        hintRadius: PIN_CODE_HINT_RADIUS,
        value: PIN_CODE_VALUE,
        withQuestion: true,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: PIN_CODE_CODE,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_RIDDLE_UID).set({
        uid: PIN_RIDDLE_UID,
        name: 'Test pin (riddle)',
        description: 'test pin',
        clue: 'What breathes fire?',
        type: 'riddle',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 10, y: 10 },
        hintRadius: null,
        value: PIN_RIDDLE_VALUE,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: PIN_RIDDLE_ANSWER,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_VISIT_UID).set({
        uid: PIN_VISIT_UID,
        name: 'Test pin (visit)',
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 20, y: 20 },
        hintRadius: null,
        value: PIN_VISIT_VALUE,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_FEEDBACK_UID).set({
        uid: PIN_FEEDBACK_UID,
        name: 'Test pin (feedback)',
        description: 'test pin',
        clue: '',
        type: 'feedback',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 30, y: 30 },
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_PHOTO_UID).set({
        uid: PIN_PHOTO_UID,
        name: 'Test pin (photo)',
        description: 'test pin',
        clue: '',
        type: 'photo',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 40, y: 40 },
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    // Outside its availability window: closed an hour ago.
    await db.collection('pins').doc(PIN_UNAVAILABLE_UID).set({
        uid: PIN_UNAVAILABLE_UID,
        name: 'Test pin (unavailable)',
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 50, y: 50 },
        hintRadius: null,
        value: PIN_UNAVAILABLE_VALUE,
        withQuestion: false,
        availableFrom: Timestamp.fromMillis(now - 2 * 60 * 60 * 1000),
        availableTo: Timestamp.fromMillis(now - 60 * 60 * 1000),
        isActive: true,
        code: null,
        collectedBy: {}
    });

    // Inactive code pin — getPins drops it; both collect paths report 'pin is not active' (decision 28).
    await db.collection('pins').doc(PIN_INACTIVE_UID).set({
        uid: PIN_INACTIVE_UID,
        name: 'Test pin (inactive)',
        description: 'test pin',
        clue: '',
        type: 'code',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 60, y: 60 },
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: false,
        code: PIN_INACTIVE_CODE,
        collectedBy: {}
    });

    // Active, opens in an hour — getPins returns it (window is filtered client-side).
    await db.collection('pins').doc(PIN_FUTURE_UID).set({
        uid: PIN_FUTURE_UID,
        name: 'Test pin (future)',
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 70, y: 70 },
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: Timestamp.fromMillis(now + 60 * 60 * 1000),
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    // Active, inside a live window — carries real timestamps for the Pin.fromRaw round-trip assertion.
    await db.collection('pins').doc(PIN_WINDOWED_UID).set({
        uid: PIN_WINDOWED_UID,
        name: 'Test pin (windowed)',
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 80, y: 80 },
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: Timestamp.fromMillis(now - 60 * 60 * 1000),
        availableTo: Timestamp.fromMillis(now + 60 * 60 * 1000),
        isActive: true,
        code: null,
        collectedBy: {}
    });
}
