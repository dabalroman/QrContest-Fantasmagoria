// Critical-path test for collectPinHandle — the server referee for the 2026 pin/quest system.
// Mirrors scoring.test.mjs: mints real ID tokens, POSTs to the actual callable, and asserts the
// score is identical in every denormalized place after collecting a pin (user doc + open round copy).
// Every new point-granting feature must extend this suite (see CLAUDE.md §9a).

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';
import {
    seedFixture, ROUND_UID,
    PIN_CODE_UID, PIN_CODE_VALUE, PIN_CODE_CODE, PIN_CODE_NAME, PIN_CODE_DESCRIPTION, PIN_CODE_HINT_RADIUS,
    PIN_RIDDLE_UID, PIN_RIDDLE_VALUE, PIN_RIDDLE_ANSWER,
    PIN_VISIT_UID, PIN_VISIT_VALUE,
    PIN_FEEDBACK_UID, PIN_FEEDBACK_VALUE, PIN_FEEDBACK_WITHQ_UID, PIN_PHOTO_UID,
    PIN_UNAVAILABLE_UID,
    PIN_INACTIVE_UID, PIN_INACTIVE_CODE,
    PIN_FUTURE_UID, PIN_WINDOWED_UID
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

    const result = await callCallable('collectPinHandle', { code: PIN_CODE_CODE }, token);
    assert.ok(result.pin);
    assert.equal(result.pin.awardedPoints, PIN_CODE_VALUE);
    assert.ok(result.question, 'expected the pin to carry a question');

    const user = (await db.collection('users').doc(uid).get()).data();
    const round = (await db.collection('ranking').doc(ROUND_UID).get()).data();

    assert.equal(user.score, PIN_CODE_VALUE, 'user.score');
    assert.equal(user.amountOfCollectedPins, 1, 'user.amountOfCollectedPins');
    assert.equal(round.users[uid].score, PIN_CODE_VALUE, 'ranking round copy score');
    assert.equal(round.users[uid].amountOfCollectedPins, 1, 'ranking round copy counter');
});

test('collectedPins snapshots name/description/value but never the secret', async () => {
    const uid = 'pin-player-snapshot';
    const token = await registerPlayer(uid, 'PinPlayerSnap');

    const result = await callCallable('collectPinHandle', { code: PIN_CODE_CODE }, token);

    // The client renders straight off this payload — `pins` is admin-only read, so anything
    // missing here is unrenderable. Mirrors how collectedCards snapshots the card.
    assert.equal(result.pin.name, PIN_CODE_NAME, 'callable payload name');
    assert.equal(result.pin.description, PIN_CODE_DESCRIPTION, 'callable payload description');
    assert.equal(result.pin.value, PIN_CODE_VALUE, 'callable payload value');

    const collectedPin = (await db.collection('users').doc(uid)
        .collection('collectedPins').doc(PIN_CODE_UID).get()).data();

    assert.equal(collectedPin.name, PIN_CODE_NAME, 'stored name');
    assert.equal(collectedPin.description, PIN_CODE_DESCRIPTION, 'stored description');
    assert.equal(collectedPin.value, PIN_CODE_VALUE, 'stored value');

    // The snapshot must never carry the pin's secret or the uid->username map of every finder.
    assert.equal(collectedPin.code, undefined, 'collectedPins must not carry the code');
    assert.equal(collectedPin.collectedBy, undefined, 'collectedPins must not carry collectedBy');
    assert.equal(result.pin.code, undefined, 'callable payload must not carry the code');
    assert.equal(result.pin.collectedBy, undefined, 'callable payload must not carry collectedBy');
});

test('code pin via pin-UI path ({pinUid, answer}) awards', async () => {
    const uid = 'pin-player-2';
    const token = await registerPlayer(uid, 'PinPlayer2');

    const result = await callCallable(
        'collectPinHandle',
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
        'collectPinHandle',
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
        () => callCallable('collectPinHandle', { code: 'SMOK000000' }, token),
        /not.?found|invalid/i
    );
});

test('visit pin via pin-UI path (no answer) awards', async () => {
    const uid = 'pin-player-5';
    const token = await registerPlayer(uid, 'PinPlayer5');

    const result = await callCallable('collectPinHandle', { pinUid: PIN_VISIT_UID }, token);
    assert.equal(result.pin.awardedPoints, PIN_VISIT_VALUE);

    const user = (await db.collection('users').doc(uid).get()).data();
    assert.equal(user.score, PIN_VISIT_VALUE);
});

test('a pin cannot be collected twice', async () => {
    const uid = 'pin-player-6';
    const token = await registerPlayer(uid, 'PinPlayer6');

    await callCallable('collectPinHandle', { pinUid: PIN_VISIT_UID }, token);
    await assert.rejects(
        () => callCallable('collectPinHandle', { pinUid: PIN_VISIT_UID }, token),
        /already/i
    );
});

test('a pin outside its availability window is rejected', async () => {
    const uid = 'pin-player-7';
    const token = await registerPlayer(uid, 'PinPlayer7');

    await assert.rejects(
        () => callCallable('collectPinHandle', { pinUid: PIN_UNAVAILABLE_UID }, token),
        /available/i
    );
});

test('wrong code / wrong riddle answer is rejected, no write, retry still possible', async () => {
    const uid = 'pin-player-8';
    const token = await registerPlayer(uid, 'PinPlayer8');

    await assert.rejects(
        () => callCallable('collectPinHandle', { pinUid: PIN_RIDDLE_UID, answer: 'wrong-answer' }, token),
        /wrong|invalid/i
    );

    // No write happened — the same pin can still be collected with the right answer.
    const result = await callCallable(
        'collectPinHandle',
        { pinUid: PIN_RIDDLE_UID, answer: PIN_RIDDLE_ANSWER },
        token
    );
    assert.equal(result.pin.awardedPoints, PIN_RIDDLE_VALUE);
});

test('photo pin is rejected (collect owned by #19\'s photo-proof flow, not collectPinHandle)', async () => {
    const uid = 'pin-player-9';
    const token = await registerPlayer(uid, 'PinPlayer9');

    await assert.rejects(
        () => callCallable('collectPinHandle', { pinUid: PIN_PHOTO_UID }, token),
        /not supported/i
    );
});

// --- Feedback pins (#12) ---

test('feedback pin awards and fans out, storing the rating and talkName', async () => {
    const uid = 'pin-player-feedback-1';
    const token = await registerPlayer(uid, 'PinPlayerFeedback1');

    const result = await callCallable(
        'collectPinHandle',
        { pinUid: PIN_FEEDBACK_UID, rating: 4, talkName: 'Wyklad o smokach' },
        token
    );
    assert.equal(result.pin.awardedPoints, PIN_FEEDBACK_VALUE);
    assert.equal(result.pin.rating, 4);
    assert.equal(result.pin.talkName, 'Wyklad o smokach');
    assert.equal(result.question, null, 'a feedback pin never draws a question');

    const collectedPin = (await db.collection('users').doc(uid)
        .collection('collectedPins').doc(PIN_FEEDBACK_UID).get()).data();
    assert.equal(collectedPin.rating, 4);
    assert.equal(collectedPin.talkName, 'Wyklad o smokach');

    const user = (await db.collection('users').doc(uid).get()).data();
    const round = (await db.collection('ranking').doc(ROUND_UID).get()).data();

    assert.equal(user.score, PIN_FEEDBACK_VALUE, 'user.score');
    assert.equal(user.amountOfCollectedPins, 1, 'user.amountOfCollectedPins');
    assert.equal(round.users[uid].score, PIN_FEEDBACK_VALUE, 'ranking round copy score');
    assert.equal(round.users[uid].amountOfCollectedPins, 1, 'ranking round copy counter');
});

test('feedback pin stores the trimmed talkName', async () => {
    const uid = 'pin-player-feedback-2';
    const token = await registerPlayer(uid, 'PinPlayerFeedback2');

    const result = await callCallable(
        'collectPinHandle',
        { pinUid: PIN_FEEDBACK_UID, rating: 5, talkName: '  Best panel ever  ' },
        token
    );
    assert.equal(result.pin.talkName, 'Best panel ever');
});

test('feedback pin rejects a missing, zero, out-of-range or non-integer rating', async () => {
    const uid = 'pin-player-feedback-3';
    const token = await registerPlayer(uid, 'PinPlayerFeedback3');

    for (const rating of [undefined, 0, 6, 2.5]) {
        await assert.rejects(
            () => callCallable(
                'collectPinHandle',
                { pinUid: PIN_FEEDBACK_UID, rating, talkName: 'Wyklad o smokach' },
                token
            ),
            /rating is invalid/i
        );
    }
});

test('feedback pin rejects a missing, too-short, over-long or forbidden-phrase talkName', async () => {
    const uid = 'pin-player-feedback-4';
    const token = await registerPlayer(uid, 'PinPlayerFeedback4');

    for (const talkName of [undefined, 'krotka', '   krotka   ', 'x'.repeat(256), 'kurwa']) {
        await assert.rejects(
            () => callCallable(
                'collectPinHandle',
                { pinUid: PIN_FEEDBACK_UID, rating: 3, talkName },
                token
            ),
            /talkName is invalid/i
        );
    }
});

test('a feedback pin cannot be submitted twice, still respects active/window guards', async () => {
    const uid = 'pin-player-feedback-5';
    const token = await registerPlayer(uid, 'PinPlayerFeedback5');

    await callCallable('collectPinHandle', { pinUid: PIN_FEEDBACK_UID, rating: 3, talkName: 'Wyklad o smokach' }, token);
    await assert.rejects(
        () => callCallable('collectPinHandle', { pinUid: PIN_FEEDBACK_UID, rating: 3, talkName: 'Wyklad o smokach' }, token),
        /already/i
    );

    await assert.rejects(
        () => callCallable('collectPinHandle', { pinUid: PIN_INACTIVE_UID, rating: 3 }, token),
        /not active/i
    );
    await assert.rejects(
        () => callCallable('collectPinHandle', { pinUid: PIN_UNAVAILABLE_UID, rating: 3 }, token),
        /available/i
    );
});

test('a feedback pin never draws a question even with withQuestion: true', async () => {
    const uid = 'pin-player-feedback-6';
    const token = await registerPlayer(uid, 'PinPlayerFeedback6');

    const result = await callCallable(
        'collectPinHandle',
        { pinUid: PIN_FEEDBACK_WITHQ_UID, rating: 3, talkName: 'Wyklad o smokach' },
        token
    );
    assert.equal(result.question, null);
});

test('normalization: surrounding whitespace and case do not matter', async () => {
    const uid = 'pin-player-10';
    const token = await registerPlayer(uid, 'PinPlayer10');

    const result = await callCallable(
        'collectPinHandle',
        { pinUid: PIN_RIDDLE_UID, answer: `  ${PIN_RIDDLE_ANSWER.toUpperCase()}  ` },
        token
    );
    assert.equal(result.pin.awardedPoints, PIN_RIDDLE_VALUE);
});

test('scanner path trims before the 10-char length check', async () => {
    const uid = 'pin-player-11';
    const token = await registerPlayer(uid, 'PinPlayer11');

    const result = await callCallable(
        'collectPinHandle',
        { code: `  ${PIN_CODE_CODE.toLowerCase()}  ` },
        token
    );
    assert.equal(result.pin.uid, PIN_CODE_UID);
});

// --- getPinsHandle: the map's read path ---

test('getPins returns active pins and drops inactive ones', async () => {
    const uid = 'pin-getpins-1';
    const token = await registerPlayer(uid, 'PinGetPins1');

    const { pins } = await callCallable('getPinsHandle', {}, token);
    const uids = pins.map((pin) => pin.uid);

    assert.ok(uids.includes(PIN_CODE_UID), 'code pin present');
    // Null-window pins are the whole game; this is the regression net against the Firestore
    // null-ordering trap (a `where('availableTo', ...)` query would silently drop them).
    assert.ok(uids.includes(PIN_VISIT_UID), 'null-window pin present');
    assert.ok(uids.includes(PIN_FEEDBACK_UID), 'feedback pin still renders');
    assert.ok(uids.includes(PIN_PHOTO_UID), 'photo pin still renders');
    assert.ok(!uids.includes(PIN_INACTIVE_UID), 'inactive pin dropped server-side');
});

test('getPins strips code and collectedBy from every returned pin', async () => {
    const uid = 'pin-getpins-2';
    const token = await registerPlayer(uid, 'PinGetPins2');

    // Collect first so at least one pin has a populated collectedBy map to try to leak.
    await callCallable('collectPinHandle', { code: PIN_CODE_CODE }, token);

    const { pins } = await callCallable('getPinsHandle', {}, token);

    assert.ok(pins.length > 0, 'expected getPins to return pins (loop must not vacuously pass)');
    for (const pin of pins) {
        assert.equal(pin.code, undefined, `pin ${pin.uid} must not carry the code`);
        assert.equal(pin.collectedBy, undefined, `pin ${pin.uid} must not carry collectedBy`);
    }
});

test('getPins carries the render payload', async () => {
    const uid = 'pin-getpins-3';
    const token = await registerPlayer(uid, 'PinGetPins3');

    const { pins } = await callCallable('getPinsHandle', {}, token);
    const byUid = Object.fromEntries(pins.map((pin) => [pin.uid, pin]));

    const codePin = byUid[PIN_CODE_UID];
    assert.equal(codePin.name, PIN_CODE_NAME);
    assert.equal(codePin.description, PIN_CODE_DESCRIPTION);
    assert.equal(codePin.value, PIN_CODE_VALUE);
    assert.equal(codePin.type, 'code');
    assert.equal(codePin.mapId, 'test-map');
    assert.deepEqual(codePin.coords, { x: 0, y: 0 });
    assert.equal(codePin.hintRadius, PIN_CODE_HINT_RADIUS);
    assert.equal(codePin.withQuestion, true);

    const riddlePin = byUid[PIN_RIDDLE_UID];
    assert.equal(riddlePin.clue, 'What breathes fire?', 'riddle clue present');
    assert.equal(riddlePin.hintRadius, null, 'non-code pin has no hint radius');
});

test('getPins timestamps carry _seconds (Pin.fromRaw); null windows stay null', async () => {
    const uid = 'pin-getpins-4';
    const token = await registerPlayer(uid, 'PinGetPins4');

    const { pins } = await callCallable('getPinsHandle', {}, token);
    const byUid = Object.fromEntries(pins.map((pin) => [pin.uid, pin]));

    const windowed = byUid[PIN_WINDOWED_UID];
    assert.equal(typeof windowed.availableFrom._seconds, 'number', 'availableFrom serialized for fromRaw');
    assert.equal(typeof windowed.availableTo._seconds, 'number', 'availableTo serialized for fromRaw');

    const nullWindow = byUid[PIN_VISIT_UID];
    assert.equal(nullWindow.availableFrom, null, 'null window stays null');
    assert.equal(nullWindow.availableTo, null, 'null window stays null');

    assert.ok(byUid[PIN_FUTURE_UID], 'future-windowed pin still returned (client hides it by clock)');
});

test('getPins requires auth', async () => {
    await assert.rejects(
        () => callCallable('getPinsHandle', {}, null),
        /permission/i
    );
});

test('both collect paths report an inactive pin identically (decision 28)', async () => {
    const uid = 'pin-getpins-6';
    const token = await registerPlayer(uid, 'PinGetPins6');

    await assert.rejects(
        () => callCallable('collectPinHandle', { pinUid: PIN_INACTIVE_UID }, token),
        /not active/i
    );
    await assert.rejects(
        () => callCallable('collectPinHandle', { code: PIN_INACTIVE_CODE }, token),
        /not active/i
    );
});
