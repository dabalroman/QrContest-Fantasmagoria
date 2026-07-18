// Structural regression net for the data-driven achievements engine (task #23).
//
// Definitions are Firestore docs, so these tests SEED definitions and assert the MECHANISM: a
// threshold crossing grants exactly once, the bonus fans out to all four denormalized places, a
// bonus can cascade into a higher threshold, the callable response surfaces the grant, a thrown
// evaluator never kills scoring, and a malformed definition doc is skipped rather than silently
// breaking things. They hold regardless of the exact threshold/bonus numbers.

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';
import {
    seedFixture, seedUser, seedLegacyUser, seedInvalidAchievements,
    GUILD_UID, ROUND_UID, CARD_CODE, QUESTION_CORRECT,
    PIN_VISIT_UID, PIN_CODE_CODE,
    ACH_SCORE_1, ACH_SCORE_2, ACH_OWL_1
} from './fixtures.mjs';

const userDoc = (uid) => db.collection('users').doc(uid).get().then((s) => s.data());
const roundUser = (uid) => db.collection('ranking').doc(ROUND_UID).get().then((s) => s.data().users[uid]);
const guildDoc = () => db.collection('guilds').doc(GUILD_UID).get().then((s) => s.data());

before(async () => {
    await assertEmulatorReachable();
});

beforeEach(async () => {
    await resetEmulator();
    await seedFixture();
});

test('crossing a threshold grants the bonus once and fans it to all four places', async () => {
    const uid = 'ach-cup';
    const token = await createAuthUserToken(uid);

    // Parked just below the first cup; joined so the guild fan-out is exercised.
    await seedUser(uid, 'AchCup', { score: ACH_SCORE_1.target - 5 });
    await callCallable('joinGuildHandle', { guild: GUILD_UID }, token);

    // A +5 visit pin lands exactly on the target → unlocks it → bonus on top.
    const res = await callCallable('collectPinHandle', { pinUid: PIN_VISIT_UID }, token);
    const expected = ACH_SCORE_1.target + ACH_SCORE_1.bonus;

    assert.deepEqual(res.achievements, [{
        uid: ACH_SCORE_1.uid, name: ACH_SCORE_1.name, icon: ACH_SCORE_1.icon, bonus: ACH_SCORE_1.bonus
    }]);

    const user = await userDoc(uid);
    const round = await roundUser(uid);
    const guild = await guildDoc();

    assert.equal(user.score, expected, 'user.score');
    assert.equal(round.score, expected, 'ranking round copy');
    assert.equal(guild.members[uid].score, expected, 'guild member copy');
    assert.equal(guild.score, expected, 'guild aggregate');

    // Stamped exactly once, recording the bonus actually awarded.
    assert.equal(Object.keys(user.achievements).length, 1);
    assert.equal(user.achievements[ACH_SCORE_1.uid].bonus, ACH_SCORE_1.bonus);
    const grantedAt = user.achievements[ACH_SCORE_1.uid].grantedAt;
    assert.ok(grantedAt, 'grantedAt stamped');

    // A further award crossing no new threshold must not re-grant it.
    const res2 = await callCallable('collectPinHandle', { code: PIN_CODE_CODE }, token);
    assert.deepEqual(res2.achievements, [], 'no re-grant');

    const user2 = await userDoc(uid);
    assert.equal(Object.keys(user2.achievements).length, 1, 'still one achievement');
    assert.ok(user2.achievements[ACH_SCORE_1.uid].grantedAt.isEqual(grantedAt), 'stamp untouched');
});

test('a bonus can cascade into a higher threshold within the same award', async () => {
    const uid = 'ach-cascade';
    const token = await createAuthUserToken(uid);

    // Positioned so the +20 code pin crosses score-1, whose bonus then carries the score over score-2.
    await seedUser(uid, 'AchCascade', { score: ACH_SCORE_2.target - 20 - ACH_SCORE_1.bonus });

    const res = await callCallable('collectPinHandle', { code: PIN_CODE_CODE }, token);
    const ids = res.achievements.map((g) => g.uid);

    assert.deepEqual(ids, [ACH_SCORE_1.uid, ACH_SCORE_2.uid], 'both granted, in threshold order');

    const user = await userDoc(uid);
    const round = await roundUser(uid);
    const expected = ACH_SCORE_2.target + ACH_SCORE_2.bonus;

    assert.equal(user.score, expected, 'both bonuses land on the user');
    assert.equal(round.score, expected, 'and both fan out to the round');
});

test('answering enough questions correctly unlocks an owl, and the counter fans out', async () => {
    const uid = 'ach-owl';
    const token = await createAuthUserToken(uid);

    await seedUser(uid, 'AchOwl', { amountOfCorrectAnswers: ACH_OWL_1.target - 1 });

    const collect = await callCallable('collectCardHandle', { code: CARD_CODE }, token);
    assert.ok(collect.question, 'card should carry a question');
    assert.deepEqual(collect.achievements, [], 'the collect itself crosses nothing');

    const answer = await callCallable(
        'answerQuestionHandle',
        { uid: collect.question.uid, answer: QUESTION_CORRECT },
        token
    );
    assert.equal(answer.correct, true);
    assert.deepEqual(answer.achievements, [{
        uid: ACH_OWL_1.uid, name: ACH_OWL_1.name, icon: ACH_OWL_1.icon, bonus: ACH_OWL_1.bonus
    }]);

    const user = await userDoc(uid);
    const round = await roundUser(uid);
    assert.equal(user.amountOfCorrectAnswers, ACH_OWL_1.target, 'correct-answer counter');
    assert.equal(round.amountOfCorrectAnswers, ACH_OWL_1.target, 'counter fanned to the round');
});

test('a wrong answer bumps the answered counter but not the correct-answer counter', async () => {
    const uid = 'ach-wrong';
    const token = await createAuthUserToken(uid);
    await seedUser(uid, 'AchWrong', {});

    const collect = await callCallable('collectCardHandle', { code: CARD_CODE }, token);
    const answer = await callCallable(
        'answerQuestionHandle',
        { uid: collect.question.uid, answer: 'b' }, // QUESTION_CORRECT is 'a'
        token
    );
    assert.equal(answer.correct, false);

    const user = await userDoc(uid);
    assert.equal(user.amountOfAnsweredQuestions, 1, 'answered counts a wrong answer');
    assert.equal(user.amountOfCorrectAnswers, 0, 'a wrong answer is not a correct one');
});

test('a thrown evaluator never kills scoring — points still land, response carries no grants', async () => {
    const uid = 'ach-throw';
    const token = await createAuthUserToken(uid);

    // A malformed achievements field makes `uid in user.achievements` throw inside the evaluator.
    await seedUser(uid, 'AchThrow', { score: ACH_SCORE_1.target - 5, achievements: 'boom' });

    const res = await callCallable('collectPinHandle', { pinUid: PIN_VISIT_UID }, token);
    assert.deepEqual(res.achievements, [], 'swallowed eval surfaces no grants');

    const user = await userDoc(uid);
    const round = await roundUser(uid);
    assert.equal(user.score, ACH_SCORE_1.target, 'base points land despite the eval throw');
    assert.equal(round.score, ACH_SCORE_1.target, 'and still fan out to the round');
});

test('a malformed definition doc is skipped and cannot grant or break scoring', async () => {
    const uid = 'ach-baddef';
    const token = await createAuthUserToken(uid);

    // Both broken defs have target 1 / bonus 1000 — if either were honoured it would grant instantly.
    await seedInvalidAchievements();
    await seedUser(uid, 'AchBadDef', {});

    const res = await callCallable('collectPinHandle', { pinUid: PIN_VISIT_UID }, token);
    assert.deepEqual(res.achievements, [], 'invalid definitions grant nothing');

    const user = await userDoc(uid);
    assert.equal(user.score, 5, 'scoring is unaffected by the invalid definitions');
    assert.equal(Object.keys(user.achievements ?? {}).length, 0, 'nothing stamped');
});

test('a legacy user doc (no achievements / no correct-answer counter) collects cleanly', async () => {
    const uid = 'ach-legacy';
    const token = await createAuthUserToken(uid);
    await seedLegacyUser(uid, 'AchLegacy');

    const res = await callCallable('collectPinHandle', { pinUid: PIN_VISIT_UID }, token);
    assert.deepEqual(res.achievements, [], 'nothing crossed');

    const user = await userDoc(uid);
    const round = await roundUser(uid);
    assert.equal(user.score, 5, 'points land for a legacy doc');
    assert.equal(round.amountOfCorrectAnswers, 0, 'new counter hydrates to 0 in the fan-out');
});
