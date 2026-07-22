// Regression net for task #4: a round-1 winner used to keep appearing in round 2's
// leaderboard until they scored again, because updateRoundsProcessor only stamped
// winnerInRound on the closing round's own copy and the master user doc - never on the
// denormalized copies living in other, still-open rounds. RoundRankingTable.tsx filters
// on that per-round copy, so inactive winners lingered indefinitely.
//
// These tests seed the `ranking/{round}.users` maps directly via the admin SDK (not
// through collect/answer) because they exercise updateRoundsProcessor's transaction in
// isolation, not the scoring fan-out (that's scoring.test.mjs's job).

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import admin from 'firebase-admin';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';

const { Timestamp, FieldValue } = admin.firestore;

before(async () => {
    await assertEmulatorReachable();
});

beforeEach(async () => {
    await resetEmulator();
});

/** A minimal `users/{uid}` doc - required because the transaction updates it directly. */
async function seedUser (uid, username, overrides = {}) {
    await db.collection('users').doc(uid).set({
        uid,
        username,
        score: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        role: 'user',
        memberOf: null,
        winnerInRound: null,
        updatedAt: FieldValue.serverTimestamp(),
        lastGuildChangeAt: FieldValue.serverTimestamp(),
        ...overrides
    });
}

/** Matches the shape of RankingRoundUser (functions/src/types/rankingRound.ts). */
function roundUser (username, score, winnerInRound = null) {
    return {
        username,
        score,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        memberOf: null,
        winnerInRound,
        updatedAt: FieldValue.serverTimestamp()
    };
}

async function seedRound (uid, name, {to, finished = false, users = {}}) {
    await db.collection('ranking').doc(uid).set({
        uid,
        name,
        finished,
        from: Timestamp.fromMillis(Date.now() - 48 * 60 * 60 * 1000),
        to,
        users,
        guilds: {}
    });
}

test('closing a round propagates winnerInRound into other still-open rounds', async () => {
    const now = Date.now();

    // Five players carried over into both round 1 (closing) and round 2 (open).
    // Top-3 by score in round 1: p1 (100), p2 (90), p3 (80). p4/p5 are not winners.
    await Promise.all([
        seedUser('p1', 'Player1'),
        seedUser('p2', 'Player2'),
        seedUser('p3', 'Player3'),
        seedUser('p4', 'Player4'),
        seedUser('p5', 'Player5')
    ]);

    const round1Users = {
        p1: roundUser('Player1', 100),
        p2: roundUser('Player2', 90),
        p3: roundUser('Player3', 80),
        p4: roundUser('Player4', 70),
        p5: roundUser('Player5', 60)
    };
    const round2Users = {
        p1: roundUser('Player1', 100),
        p2: roundUser('Player2', 90),
        p3: roundUser('Player3', 80),
        p4: roundUser('Player4', 70),
        p5: roundUser('Player5', 60)
    };

    await seedRound('1', 'pierwsza', {
        to: Timestamp.fromMillis(now - 60 * 60 * 1000), // in the past -> about to close
        finished: false,
        users: round1Users
    });
    await seedRound('2', 'druga', {
        to: Timestamp.fromMillis(now + 24 * 60 * 60 * 1000), // in the future -> stays open
        finished: false,
        users: round2Users
    });

    await seedUser('caller', 'Caller', { role: 'admin' });
    const token = await createAuthUserToken('caller');
    await callCallable('updateRoundsHandle', {}, token);

    const round1 = (await db.collection('ranking').doc('1').get()).data();
    const round2 = (await db.collection('ranking').doc('2').get()).data();

    assert.equal(round1.finished, true, 'round 1 should be marked finished');
    assert.equal(round2.finished, false, 'round 2 should remain open');

    // Round 1's own copy: top-3 stamped, as before.
    assert.equal(round1.users.p1.winnerInRound, '1');
    assert.equal(round1.users.p2.winnerInRound, '1');
    assert.equal(round1.users.p3.winnerInRound, '1');

    // The fix: round 2's (still-open) copy is propagated too, without any further action.
    assert.equal(round2.users.p1.winnerInRound, '1', 'winner propagated into open round');
    assert.equal(round2.users.p2.winnerInRound, '1', 'winner propagated into open round');
    assert.equal(round2.users.p3.winnerInRound, '1', 'winner propagated into open round');

    // Non-winners are untouched everywhere.
    assert.equal(round1.users.p4.winnerInRound, null);
    assert.equal(round2.users.p4.winnerInRound, null, 'non-winner unaffected in round 2');
    assert.equal(round1.users.p5.winnerInRound, null);
    assert.equal(round2.users.p5.winnerInRound, null, 'non-winner unaffected in round 2');
});

test('two rounds closing in the same pass do not cross-contaminate each other', async () => {
    const now = Date.now();

    // shared1 wins round 1 but is also present (non-winning) in round 2.
    // shared2 wins round 2 but is also present (non-winning) in round 1.
    // Both are carried over into round 3, which stays open.
    await Promise.all([
        seedUser('shared1', 'Shared1'),
        seedUser('shared2', 'Shared2'),
        seedUser('r1b', 'Round1B'),
        seedUser('r1c', 'Round1C'),
        seedUser('r2b', 'Round2B'),
        seedUser('r2c', 'Round2C')
    ]);

    const round1Users = {
        shared1: roundUser('Shared1', 100), // top-3 winner of round 1
        r1b: roundUser('Round1B', 90),      // top-3 winner of round 1
        r1c: roundUser('Round1C', 80),      // top-3 winner of round 1
        shared2: roundUser('Shared2', 10)   // present, not a round-1 winner
    };
    const round2Users = {
        shared2: roundUser('Shared2', 100), // top-3 winner of round 2
        r2b: roundUser('Round2B', 90),      // top-3 winner of round 2
        r2c: roundUser('Round2C', 80),      // top-3 winner of round 2
        shared1: roundUser('Shared1', 10)   // present, not a round-2 winner
    };
    const round3Users = {
        shared1: roundUser('Shared1', 5),
        shared2: roundUser('Shared2', 5)
    };

    await seedRound('1', 'pierwsza', {
        to: Timestamp.fromMillis(now - 60 * 60 * 1000), // closes this pass
        finished: false,
        users: round1Users
    });
    await seedRound('2', 'druga', {
        to: Timestamp.fromMillis(now - 30 * 60 * 1000), // closes this pass too
        finished: false,
        users: round2Users
    });
    await seedRound('3', 'trzecia', {
        to: Timestamp.fromMillis(now + 24 * 60 * 60 * 1000), // stays open
        finished: false,
        users: round3Users
    });

    await seedUser('caller', 'Caller', { role: 'admin' });
    const token = await createAuthUserToken('caller');
    await callCallable('updateRoundsHandle', {}, token);

    const round1 = (await db.collection('ranking').doc('1').get()).data();
    const round2 = (await db.collection('ranking').doc('2').get()).data();
    const round3 = (await db.collection('ranking').doc('3').get()).data();

    assert.equal(round1.finished, true);
    assert.equal(round2.finished, true);
    assert.equal(round3.finished, false);

    // Each round's own top-3 stamp is correct.
    assert.equal(round1.users.shared1.winnerInRound, '1');
    assert.equal(round2.users.shared2.winnerInRound, '2');

    // No cross-contamination between the two rounds closing in the same pass:
    // shared2 lost in round 1, so round 1's propagation must not touch round 2's copy,
    // and shared1 lost in round 2, so round 2's propagation must not touch round 1's copy.
    assert.equal(round1.users.shared2.winnerInRound, null, 'round 2 winner must not leak into round 1');
    assert.equal(round2.users.shared1.winnerInRound, null, 'round 1 winner must not leak into round 2');

    // Round 3 (still open, not part of the closing set) receives both propagations correctly.
    assert.equal(round3.users.shared1.winnerInRound, '1', 'round 1 winner propagated into open round 3');
    assert.equal(round3.users.shared2.winnerInRound, '2', 'round 2 winner propagated into open round 3');
});

test('updateRoundsHandle requires auth', async () => {
    await assert.rejects(
        () => callCallable('updateRoundsHandle', {}, null),
        /permission/i
    );
});

test('updateRoundsHandle rejects a non-admin', async () => {
    await seedUser('plain', 'Plain');
    const token = await createAuthUserToken('plain');
    await assert.rejects(
        () => callCallable('updateRoundsHandle', {}, token),
        /permission/i
    );
});
