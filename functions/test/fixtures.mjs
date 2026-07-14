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
}
