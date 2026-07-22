// Regression net for seedDatabaseHandle's full-population guarantee (task #6, guards the
// fire-and-forget bug fixed in task #5 / commit 2a4b0f4).
//
// The handler used to `forEach(x => db...set(x))` without awaiting, so a real Cloud Functions v2
// invocation could freeze the instance before the writes flushed and leave the DB partially seeded.
// The fix awaits every write (`await Promise.all(...map(...))`). This suite drives the REAL handler
// with the REAL compiled seeds (not seedFixture) and asserts every collection is fully populated.
//
// Expected counts DERIVE from the same compiled ../lib/seeds/*.js modules the deployed function
// loads at runtime, so the test can never disagree with what the function actually writes and it
// self-updates as seed content changes. Never hard-code counts.
//
// ⚠️ Load-bearing: the population assertions run on a SINGLE immediate query right after the
// callable resolves - no sleep, no poll/retry. A reintroduced fire-and-forget leaves writes in
// flight; a retry loop would let them eventually flush and mask the regression.

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';

// The compiled seeds are CommonJS (`exports.default = seed`); imported from ESM the default binding
// is the module.exports object, so the payload lives under `.default`. `?? mod` keeps it robust if a
// future build emits a bare default.
import pinsSeedMod from '../lib/seeds/pinsSeed.js';
import pinGroupsSeedMod from '../lib/seeds/pinGroupsSeed.js';
import rankingRoundsSeedMod from '../lib/seeds/rankingRoundsSeed.js';
import achievementsSeedMod from '../lib/seeds/achievementsSeed.js';
import questionsSeedMod from '../lib/seeds/questionsSeed.js';

const unwrap = (mod) => mod.default ?? mod;

// Array seeds → one doc per element in the named collection.
const ARRAY_SEEDS = [
    ['pins', unwrap(pinsSeedMod)],
    ['pinGroups', unwrap(pinGroupsSeedMod)],
    ['ranking', unwrap(rankingRoundsSeedMod)],
    ['achievements', unwrap(achievementsSeedMod)]
];

// The card game and clubs are retired (CLAUDE.md §7a) and deliberately no longer seeded, even
// though their seed files and handlers still exist. Clues belong to the card game too - each one
// is a riddle pointing at a hidden card.
const RETIRED_COLLECTIONS = ['cards', 'cardSets', 'guilds', 'clues'];

// questionsSeed is a map object (not an array), written whole to the single doc questions/questions.
const questionsSeed = unwrap(questionsSeedMod);

const PASSWORD = '4064';

async function makeAdmin (uid) {
    const token = await createAuthUserToken(uid);
    await db.collection('users').doc(uid).set({ role: 'admin' });
    return token;
}

before(async () => {
    await assertEmulatorReachable();
});

beforeEach(async () => {
    await resetEmulator();
});

test('an admin seed fully populates every collection', async () => {
    const token = await makeAdmin('seed-admin');

    const result = await callCallable('seedDatabaseHandle', { password: PASSWORD }, token);
    assert.deepEqual(result, { status: 'ok' }, 'handler returns ok');

    // Single immediate query per collection - NO settle delay, NO retry (see file header).
    for (const [collection, seed] of ARRAY_SEEDS) {
        const snapshot = await db.collection(collection).get();
        assert.equal(snapshot.size, seed.length, `${collection} doc count === seed length`);
    }

    for (const collection of RETIRED_COLLECTIONS) {
        const snapshot = await db.collection(collection).get();
        assert.equal(snapshot.size, 0, `${collection} is retired and must not be seeded`);
    }

    const questionsDoc = await db.collection('questions').doc('questions').get();
    assert.ok(questionsDoc.exists, 'questions/questions doc exists');
    assert.equal(
        Object.keys(questionsDoc.data()).length,
        Object.keys(questionsSeed).length,
        'questions map key count === seed key count'
    );
});

test('re-seeding preserves a round\'s users map and finished flag', async () => {
    const token = await makeAdmin('seed-admin');
    const seededRound = unwrap(rankingRoundsSeedMod)[0];

    await callCallable('seedDatabaseHandle', { password: PASSWORD }, token);

    // A played, closed round with a stale `to` - the state a re-seed must not destroy.
    await db.collection('ranking').doc(seededRound.uid).update({
        users: { 'player-1': { username: 'Player1', score: 42 } },
        finished: true,
        to: new Date('2000-01-01T00:00:00Z')
    });

    await callCallable('seedDatabaseHandle', { password: PASSWORD }, token);

    const round = (await db.collection('ranking').doc(seededRound.uid).get()).data();
    assert.ok(round.users['player-1'], 'the leaderboard must survive a re-seed');
    assert.equal(round.users['player-1'].score, 42, 'the scores must survive a re-seed');
    assert.equal(round.finished, true, 'a finished round must not reopen');
    assert.equal(
        round.to.toDate().getTime(),
        seededRound.to.getTime(),
        'an edited to must still land'
    );
});

test('unauthenticated seed is rejected (auth gate)', async () => {
    await assert.rejects(
        () => callCallable('seedDatabaseHandle', { password: PASSWORD }, undefined),
        /permission/i
    );
});

test('authed seed with wrong password is rejected (password gate)', async () => {
    const token = await makeAdmin('seed-admin');
    await assert.rejects(
        () => callCallable('seedDatabaseHandle', { password: '0000' }, token),
        /permission/i
    );
});

test('authed seed with missing password is rejected (password gate)', async () => {
    const token = await makeAdmin('seed-admin');
    await assert.rejects(
        () => callCallable('seedDatabaseHandle', {}, token),
        /permission/i
    );
});

test('correct password but no user doc is rejected (admin gate)', async () => {
    // Correct password reaches the admin check; createAuthUserToken does NOT create the user doc.
    const token = await createAuthUserToken('no-doc-user');
    await assert.rejects(
        () => callCallable('seedDatabaseHandle', { password: PASSWORD }, token),
        /permission/i
    );
});

test('correct password but role user is rejected (admin gate)', async () => {
    const token = await createAuthUserToken('plain-user');
    await db.collection('users').doc('plain-user').set({ role: 'user' });
    await assert.rejects(
        () => callCallable('seedDatabaseHandle', { password: PASSWORD }, token),
        /permission/i
    );
});
