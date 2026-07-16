// Critical-path test for completePinHandle — the server referee for the 2026 pin/quest system.
// Mirrors scoring.test.mjs: mints real ID tokens, POSTs to the actual callable, and asserts the
// score is identical in every denormalized place after a completion (user doc + open round copy).
// Every new point-granting feature must extend this suite (see CLAUDE.md §9a).

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';
import {
    seedFixture, ROUND_UID,
    PIN_CODE_UID, PIN_CODE_VALUE, PIN_CODE_CODE,
    PIN_RIDDLE_UID, PIN_RIDDLE_VALUE, PIN_RIDDLE_ANSWER,
    PIN_VISIT_UID, PIN_VISIT_VALUE,
    PIN_FEEDBACK_UID, PIN_PHOTO_UID,
    PIN_UNAVAILABLE_UID
} from './fixtures.mjs';

before(async () => {
    await assertEmulatorReachable();
});

beforeEach(async () => {
    await resetEmulator();
    await seedFixture();
});

async function registerPlayer (uid, username) {
    const token = await createAuthUserToken(uid);
    await callCallable('setupAccountHandle', { username }, token);
    return token;
}

test('code pin via global scanner path awards and fans out', async () => {
    const uid = 'pin-player-1';
    const token = await registerPlayer(uid, 'PinPlayer1');

    const result = await callCallable('completePinHandle', { code: PIN_CODE_CODE }, token);
    assert.ok(result.pin);
    assert.equal(result.pin.awardedPoints, PIN_CODE_VALUE);
    assert.ok(result.question, 'expected the pin to carry a question');

    const user = (await db.collection('users').doc(uid).get()).data();
    const round = (await db.collection('ranking').doc(ROUND_UID).get()).data();

    assert.equal(user.score, PIN_CODE_VALUE, 'user.score');
    assert.equal(user.amountOfCompletedPins, 1, 'user.amountOfCompletedPins');
    assert.equal(round.users[uid].score, PIN_CODE_VALUE, 'ranking round copy score');
    assert.equal(round.users[uid].amountOfCompletedPins, 1, 'ranking round copy counter');
});

test('code pin via pin-UI path ({pinUid, answer}) awards', async () => {
    const uid = 'pin-player-2';
    const token = await registerPlayer(uid, 'PinPlayer2');

    const result = await callCallable(
        'completePinHandle',
        { pinUid: PIN_CODE_UID, answer: PIN_CODE_CODE },
        token
    );
    assert.equal(result.pin.awardedPoints, PIN_CODE_VALUE);

    const user = (await db.collection('users').doc(uid).get()).data();
    assert.equal(user.score, PIN_CODE_VALUE);
});

test('riddle pin via pin-UI path awards', async () => {
    const uid = 'pin-player-3';
    const token = await registerPlayer(uid, 'PinPlayer3');

    const result = await callCallable(
        'completePinHandle',
        { pinUid: PIN_RIDDLE_UID, answer: PIN_RIDDLE_ANSWER },
        token
    );
    assert.equal(result.pin.awardedPoints, PIN_RIDDLE_VALUE);

    const user = (await db.collection('users').doc(uid).get()).data();
    assert.equal(user.score, PIN_RIDDLE_VALUE);
});

test('riddle pin via global scanner path is not found (anti-bruteforce)', async () => {
    const uid = 'pin-player-4';
    const token = await registerPlayer(uid, 'PinPlayer4');

    // Pad to 10 chars since the global scanner path enforces a 10-char code shape.
    await assert.rejects(
        () => callCallable('completePinHandle', { code: 'SMOK000000' }, token),
        /not.?found|invalid/i
    );
});

test('visit pin via pin-UI path (no answer) awards', async () => {
    const uid = 'pin-player-5';
    const token = await registerPlayer(uid, 'PinPlayer5');

    const result = await callCallable('completePinHandle', { pinUid: PIN_VISIT_UID }, token);
    assert.equal(result.pin.awardedPoints, PIN_VISIT_VALUE);

    const user = (await db.collection('users').doc(uid).get()).data();
    assert.equal(user.score, PIN_VISIT_VALUE);
});

test('a pin cannot be completed twice', async () => {
    const uid = 'pin-player-6';
    const token = await registerPlayer(uid, 'PinPlayer6');

    await callCallable('completePinHandle', { pinUid: PIN_VISIT_UID }, token);
    await assert.rejects(
        () => callCallable('completePinHandle', { pinUid: PIN_VISIT_UID }, token),
        /already/i
    );
});

test('a pin outside its availability window is rejected', async () => {
    const uid = 'pin-player-7';
    const token = await registerPlayer(uid, 'PinPlayer7');

    await assert.rejects(
        () => callCallable('completePinHandle', { pinUid: PIN_UNAVAILABLE_UID }, token),
        /available/i
    );
});

test('wrong code / wrong riddle answer is rejected, no write, retry still possible', async () => {
    const uid = 'pin-player-8';
    const token = await registerPlayer(uid, 'PinPlayer8');

    await assert.rejects(
        () => callCallable('completePinHandle', { pinUid: PIN_RIDDLE_UID, answer: 'wrong-answer' }, token),
        /wrong|invalid/i
    );

    // No write happened — the same pin can still be completed with the right answer.
    const result = await callCallable(
        'completePinHandle',
        { pinUid: PIN_RIDDLE_UID, answer: PIN_RIDDLE_ANSWER },
        token
    );
    assert.equal(result.pin.awardedPoints, PIN_RIDDLE_VALUE);
});

test('feedback and photo pins are rejected (not implemented yet)', async () => {
    const uid = 'pin-player-9';
    const token = await registerPlayer(uid, 'PinPlayer9');

    await assert.rejects(
        () => callCallable('completePinHandle', { pinUid: PIN_FEEDBACK_UID }, token),
        /not supported/i
    );
    await assert.rejects(
        () => callCallable('completePinHandle', { pinUid: PIN_PHOTO_UID }, token),
        /not supported/i
    );
});

test('normalization: surrounding whitespace and case do not matter', async () => {
    const uid = 'pin-player-10';
    const token = await registerPlayer(uid, 'PinPlayer10');

    const result = await callCallable(
        'completePinHandle',
        { pinUid: PIN_RIDDLE_UID, answer: `  ${PIN_RIDDLE_ANSWER.toUpperCase()}  ` },
        token
    );
    assert.equal(result.pin.awardedPoints, PIN_RIDDLE_VALUE);
});

test('scanner path trims before the 10-char length check', async () => {
    const uid = 'pin-player-11';
    const token = await registerPlayer(uid, 'PinPlayer11');

    const result = await callCallable(
        'completePinHandle',
        { code: `  ${PIN_CODE_CODE.toLowerCase()}  ` },
        token
    );
    assert.equal(result.pin.uid, PIN_CODE_UID);
});
