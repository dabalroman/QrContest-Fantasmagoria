// Critical-path test: register → join guild → collect a card → answer its question,
// then assert the score is identical in all four places it gets denormalized to.
//
// This is the regression net for the leaderboard. Any change to how points are awarded
// (task #3 unify-scoring, new quest/achievement point sources) must keep this green.

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';
import {
    seedFixture, CARD_CODE, GUILD_UID, ROUND_UID,
    QUESTION_CORRECT, EXPECTED_TOTAL
} from './fixtures.mjs';

before(async () => {
    await assertEmulatorReachable();
});

beforeEach(async () => {
    await resetEmulator();
    await seedFixture();
});

test('score stays consistent across user, round and guild after collect + answer', async () => {
    const uid = 'player-1';
    const token = await createAuthUserToken(uid);

    // Register + join a guild so the guild fan-out path is exercised.
    await callCallable('setupAccountHandle', { username: 'TestPlayer' }, token);
    await callCallable('joinGuildHandle', { guild: GUILD_UID }, token);

    // Collect the card - awards CARD_VALUE and hands back a question.
    const collect = await callCallable('collectCardHandle', { code: CARD_CODE }, token);
    assert.ok(collect.question, 'expected the card to carry a question');

    // Answer it correctly - awards QUESTION_VALUE.
    const answer = await callCallable(
        'answerQuestionHandle',
        { uid: collect.question.uid, answer: QUESTION_CORRECT },
        token
    );
    assert.equal(answer.correct, true);

    // --- the actual invariant: the same number in four places ---
    const user = (await db.collection('users').doc(uid).get()).data();
    const round = (await db.collection('ranking').doc(ROUND_UID).get()).data();
    const guild = (await db.collection('guilds').doc(GUILD_UID).get()).data();

    assert.equal(user.score, EXPECTED_TOTAL, 'user.score');
    assert.equal(round.users[uid].score, EXPECTED_TOTAL, 'ranking round copy');
    assert.equal(guild.members[uid].score, EXPECTED_TOTAL, 'guild member copy');
    assert.equal(guild.score, EXPECTED_TOTAL, 'guild aggregate (single member)');

    // counters should agree too
    assert.equal(user.amountOfCollectedCards, 1);
    assert.equal(user.amountOfAnsweredQuestions, 1);
    assert.equal(round.users[uid].amountOfCollectedCards, 1);
    assert.equal(round.users[uid].amountOfAnsweredQuestions, 1);
});

test('a card cannot be collected twice', async () => {
    const uid = 'player-2';
    const token = await createAuthUserToken(uid);
    await callCallable('setupAccountHandle', { username: 'SecondPlayer' }, token);

    await callCallable('collectCardHandle', { code: CARD_CODE }, token);
    await assert.rejects(
        () => callCallable('collectCardHandle', { code: CARD_CODE }, token),
        /already/i,
        'second collect of the same card should be rejected'
    );
});
