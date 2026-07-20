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
// callable resolves — no sleep, no poll/retry. A reintroduced fire-and-forget leaves writes in
// flight; a retry loop would let them eventually flush and mask the regression.

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';

// The compiled seeds are CommonJS (`exports.default = seed`); imported from ESM the default binding
// is the module.exports object, so the payload lives under `.default`. `?? mod` keeps it robust if a
// future build emits a bare default.
import cardsSeedMod from '../lib/seeds/cardsSeed.js';
import pinsSeedMod from '../lib/seeds/pinsSeed.js';
import pinGroupsSeedMod from '../lib/seeds/pinGroupsSeed.js';
import cardSetsSeedMod from '../lib/seeds/cardSetsSeed.js';
import rankingRoundsSeedMod from '../lib/seeds/rankingRoundsSeed.js';
import guildsSeedMod from '../lib/seeds/guildsSeed.js';
import cluesSeedMod from '../lib/seeds/cluesSeed.js';
import achievementsSeedMod from '../lib/seeds/achievementsSeed.js';
import questionsSeedMod from '../lib/seeds/questionsSeed.js';

const unwrap = (mod) => mod.default ?? mod;

// Array seeds → one doc per element in the named collection.
const ARRAY_SEEDS = [
    ['cards', unwrap(cardsSeedMod)],
    ['pins', unwrap(pinsSeedMod)],
    ['pinGroups', unwrap(pinGroupsSeedMod)],
    ['cardSets', unwrap(cardSetsSeedMod)],
    ['ranking', unwrap(rankingRoundsSeedMod)],
    ['guilds', unwrap(guildsSeedMod)],
    ['clues', unwrap(cluesSeedMod)],
    ['achievements', unwrap(achievementsSeedMod)]
];

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

    // Single immediate query per collection — NO settle delay, NO retry (see file header).
    for (const [collection, seed] of ARRAY_SEEDS) {
        const snapshot = await db.collection(collection).get();
        assert.equal(snapshot.size, seed.length, `${collection} doc count === seed length`);
    }

    const questionsDoc = await db.collection('questions').doc('questions').get();
    assert.ok(questionsDoc.exists, 'questions/questions doc exists');
    assert.equal(
        Object.keys(questionsDoc.data()).length,
        Object.keys(questionsSeed).length,
        'questions map key count === seed key count'
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
