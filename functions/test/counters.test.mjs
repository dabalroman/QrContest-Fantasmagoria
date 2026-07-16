// Regression net for the counter-hydration boundary (getCurrentUser).
//
// The `User` type declares every counter as required, but a doc written before a counter existed
// simply lacks that field. getCurrentUser applies USER_COUNTER_DEFAULTS so the type stops lying;
// without that, updateRanking copies `undefined` into the round doc and the whole award throws.
// These tests drive the two award paths with a deliberately legacy user doc.

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';
import {
    seedFixture, seedLegacyUser, CARD_CODE, CARD_VALUE, ROUND_UID,
    PIN_VISIT_UID, PIN_VISIT_VALUE
} from './fixtures.mjs';

before(async () => {
    await assertEmulatorReachable();
});

beforeEach(async () => {
    await resetEmulator();
    await seedFixture();
});

test('a user doc missing amountOfCompletedPins can still collect a card', async () => {
    const uid = 'legacy-player-1';
    const token = await createAuthUserToken(uid);
    await seedLegacyUser(uid, 'LegacyPlayer1');

    await callCallable('collectCardHandle', { code: CARD_CODE }, token);

    const user = (await db.collection('users').doc(uid).get()).data();
    const roundUser = (await db.collection('ranking').doc(ROUND_UID).get()).data().users[uid];

    assert.equal(user.score, CARD_VALUE, 'user.score');
    assert.equal(roundUser.score, CARD_VALUE, 'ranking round copy score');
    assert.equal(user.amountOfCollectedCards, 1, 'the counter this award does touch');

    // The award never touched amountOfCompletedPins, so nothing normalized it per-site — the round
    // copy must still carry a real 0 rather than undefined (rejected by Firestore) or NaN.
    assert.equal(roundUser.amountOfCompletedPins, 0, 'ranking round copy untouched counter');
});

test('a user doc missing amountOfCompletedPins can complete a pin, and the counter agrees', async () => {
    const uid = 'legacy-player-2';
    const token = await createAuthUserToken(uid);
    await seedLegacyUser(uid, 'LegacyPlayer2');

    await callCallable('completePinHandle', { pinUid: PIN_VISIT_UID }, token);

    const user = (await db.collection('users').doc(uid).get()).data();
    const roundUser = (await db.collection('ranking').doc(ROUND_UID).get()).data().users[uid];

    assert.equal(user.score, PIN_VISIT_VALUE, 'user.score');
    assert.equal(roundUser.score, PIN_VISIT_VALUE, 'ranking round copy score');

    // Incrementing a counter the doc never had must land on 1, not NaN.
    assert.equal(user.amountOfCompletedPins, 1, 'user.amountOfCompletedPins');
    assert.equal(roundUser.amountOfCompletedPins, 1, 'ranking round copy');
});
