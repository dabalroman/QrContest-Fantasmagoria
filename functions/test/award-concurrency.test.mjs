// Regression net for task #55: awardPoints had no transactional read on the user doc, so two awards
// for the SAME user that overlap in time did not serialize. Each read the same pre-award snapshot,
// independently saw an achievement threshold as newly crossed, and folded the bonus into its own
// score increment — a permanent double-count that does not self-heal (increments compose).
//
// ⚠️ The two awards MUST come from two DIFFERENT callables. The functions emulator queues concurrent
// invocations of the SAME function, so racing collectPinHandle against itself silently serializes and
// the second call reads post-commit state — the race never reproduces and the test passes even against
// the unfixed code. Racing reviewPhotoHandle against collectPinHandle (the task's own failure scenario)
// puts the two awards in different workers, which genuinely overlap.

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable, db
} from './emulator.mjs';
import {
    seedFixture, seedUser, seedPhotoObject,
    ROUND_UID,
    PIN_VISIT_UID, PIN_VISIT_VALUE, PIN_PHOTO_UID, PIN_PHOTO_VALUE,
    ACH_SCORE_1
} from './fixtures.mjs';

const userDoc = (uid) => db.collection('users').doc(uid).get().then((s) => s.data());
const roundUser = (uid) => db.collection('ranking').doc(ROUND_UID).get().then((s) => s.data().users[uid]);

async function registerAdmin (uid, username) {
    const token = await createAuthUserToken(uid);
    await seedUser(uid, username, { role: 'admin' });
    return token;
}

before(async () => {
    await assertEmulatorReachable();
});

beforeEach(async () => {
    await resetEmulator();
    await seedFixture();
});

test('two overlapping same-user awards crossing a threshold grant the bonus exactly once', async () => {
    const uid = 'race-user';
    const token = await createAuthUserToken(uid);
    const adminToken = await registerAdmin('race-admin', 'RaceAdmin');

    // Parked so BOTH awards, evaluated against the same pre-award snapshot, independently see
    // ACH_SCORE_1 as newly crossed — a single +5 award lands exactly on the cup.
    const start = ACH_SCORE_1.target - PIN_VISIT_VALUE;
    await seedUser(uid, 'RaceUser', { score: start });

    // Park a photo submission in `pending`. Approving it awards through the same shared awardPoints.
    await seedPhotoObject(uid, PIN_PHOTO_UID);
    const { submissionUid } = await callCallable('submitPhotoHandle', { pinUid: PIN_PHOTO_UID }, token);

    // The race: a photo approval and a pin collect landing on the same user at the same moment.
    const [collectRes, reviewRes] = await Promise.all([
        callCallable('collectPinHandle', { pinUid: PIN_VISIT_UID }, token),
        callCallable('reviewPhotoHandle', { submissionUid, decision: 'approve' }, adminToken)
    ]);

    // Exactly one of the two responses surfaces the grant (whichever transaction observed the
    // crossing); the other, retrying against post-grant state, surfaces none.
    const grantsSurfaced = [...collectRes.achievements, ...reviewRes.achievements];
    assert.equal(grantsSurfaced.length, 1, 'grant surfaced exactly once across the two responses');
    assert.equal(grantsSurfaced[0].uid, ACH_SCORE_1.uid);

    const expected = start + PIN_VISIT_VALUE + PIN_PHOTO_VALUE + ACH_SCORE_1.bonus;

    const user = await userDoc(uid);
    const round = await roundUser(uid);

    assert.equal(user.score, expected, 'user.score (bonus counted once)');
    assert.equal(round.score, expected, 'ranking round copy');

    // Stamped exactly once, recording the bonus actually awarded.
    assert.equal(Object.keys(user.achievements).length, 1, 'one achievement entry');
    assert.equal(user.achievements[ACH_SCORE_1.uid].bonus, ACH_SCORE_1.bonus);

    // The approval cleared the pending hold; it is never left dangling by the retry.
    assert.equal(user.pendingScore, 0, 'pendingScore cleared');
});
