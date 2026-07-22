// Minimal deterministic fixture seeded straight through the admin SDK - not the real
// 64-card seed. Just enough for the handlers to run: one open ranking round, one guild,
// one collectible card that carries a question, and the questions doc.

import admin from 'firebase-admin';
import { db, bucket } from './emulator.mjs';
import canonicalUsernameMod from '../lib/actions/canonicalUsername.js';
const canonicalUsername = canonicalUsernameMod.default ?? canonicalUsernameMod;

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

// --- Pins ---
export const PIN_CODE_UID = 'test-pin-code';
export const PIN_CODE_VALUE = 20;
export const PIN_CODE_CODE = 'PINCODE001';     // 10 chars, [A-Z0-9]
export const PIN_CODE_NAME = 'Test pin (code)';
export const PIN_CODE_DESCRIPTION = 'test pin';
export const PIN_CODE_HINT_RADIUS = 120;       // getPins must carry this through (decision 26)

export const PIN_RIDDLE_UID = 'test-pin-riddle';
export const PIN_RIDDLE_VALUE = 15;
export const PIN_RIDDLE_ANSWER = 'smok';       // free-text, matched case/whitespace-insensitively

export const PIN_VISIT_UID = 'test-pin-visit';
export const PIN_VISIT_VALUE = 5;

export const PIN_FEEDBACK_UID = 'test-pin-feedback';
export const PIN_FEEDBACK_VALUE = 5;
export const PIN_FEEDBACK_WITHQ_UID = 'test-pin-feedback-withq';
export const PIN_PHOTO_UID = 'test-pin-photo';
export const PIN_PHOTO_VALUE = 5;

// Ghost pin (#60): riddle-like, but its answer is a printed 10-char code, so the global scanner path
// looks it up alongside CODE pins. Also the only fixture pin carrying a clueImage.
export const PIN_GHOST_UID = 'test-pin-ghost';
export const PIN_GHOST_VALUE = 15;
export const PIN_GHOST_CODE = 'PINGHOST01';   // 10 chars, [A-Z0-9]
export const PIN_GHOST_CLUE_IMAGE = 'test-clue';

/**
 * Seed a Storage object at the derived photo path, the way the client's uploadBytes would - including
 * the `firebaseStorageDownloadTokens` custom metadata the emulator auto-creates on a real upload, so
 * getPhotoSubmissionsHandle can build a download-token URL. submitPhotoHandle's object-exists check
 * needs this present before it will accept a submit (#19).
 */
export async function seedPhotoObject (userUid, pinUid, token = 'test-token') {
    await bucket.file(`users/${userUid}/photos/${pinUid}`).save(Buffer.from('fake-image-bytes'), {
        metadata: {
            contentType: 'image/jpeg',
            metadata: { firebaseStorageDownloadTokens: token }
        }
    });
}

export const PIN_UNAVAILABLE_UID = 'test-pin-unavailable';
export const PIN_UNAVAILABLE_VALUE = 5;

// Inactive code pin - getPins must drop it, and BOTH collect entry paths must report it identically
// as 'pin is not active' (decision 28). There is no inactive pin without this fixture.
export const PIN_INACTIVE_UID = 'test-pin-inactive';
export const PIN_INACTIVE_CODE = 'PININACT01';  // 10 chars, [A-Z0-9]

// Active but outside/inside its window - getPins returns both (window is filtered client-side); these
// pin the timestamp-round-trip through Pin.fromRaw (which reads `._seconds`).
export const PIN_FUTURE_UID = 'test-pin-future';
export const PIN_WINDOWED_UID = 'test-pin-windowed';

/**
 * A user doc as it looked before `amountOfCollectedPins` existed - written straight through the
 * admin SDK so it bypasses setupAccountHandle, which would initialize every counter. Mirrors what
 * an account created mid-development actually holds, and re-arms for every counter added later.
 */
export async function seedLegacyUser (uid, username) {
    await db.collection('users').doc(uid).set({
        uid,
        username,
        score: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        // amountOfCollectedPins deliberately absent - that is the whole point of this fixture.
        role: 'user',
        memberOf: null,
        winnerInRound: null,
        updatedAt: FieldValue.serverTimestamp(),
        lastGuildChangeAt: Timestamp.fromDate(new Date('2020/01/01'))
    });

    await db.collection('users-usernames').doc(canonicalUsername(username)).set({ uid });

    // collectCardHandle / collectPinHandle transaction.update this doc - it must exist.
    await db.collection('users').doc(uid)
        .collection('collectedQuestions').doc('collectedQuestions')
        .set({});
}

// Achievement definitions are DATA now, so the fixture seeds the real ones rather than relying on a
// code registry. Kept in step with functions/src/seeds/achievementsSeed.ts; the tests are structural
// and assert the mechanism, so they hold whatever the numbers are.
export const ACH_SCORE_1 = { uid: 'score-1', target: 50, bonus: 5, name: 'Nowicjusz', icon: 'medal' };
export const ACH_SCORE_2 = { uid: 'score-2', target: 150, bonus: 10, name: 'Tropiciel', icon: 'medal' };
export const ACH_OWL_1 = { uid: 'owl-1', target: 5, bonus: 10, name: 'Sówka', icon: 'owl' };

// Deliberately malformed - an unknown `type` and a `target` saved as a string. loadDefinitions must
// skip BOTH and log ACHIEVEMENTS_DEF_INVALID rather than silently no-op or break scoring.
export const ACH_BROKEN_TYPE_UID = 'broken-type';
export const ACH_BROKEN_TARGET_UID = 'broken-target';

export async function seedAchievements () {
    const defs = [
        { ...ACH_SCORE_1, description: 'test', group: 'score', type: 'points' },
        { ...ACH_SCORE_2, description: 'test', group: 'score', type: 'points' },
        { uid: 'score-3', name: 'Zbieracz', description: 'test', icon: 'medal', group: 'score', type: 'points', target: 300, bonus: 15 },
        { ...ACH_OWL_1, description: 'test', group: 'owl', type: 'correctAnswers' }
    ];

    await Promise.all(defs.map((def) => db.collection('achievements').doc(def.uid).set(def)));
}

export async function seedInvalidAchievements () {
    await db.collection('achievements').doc(ACH_BROKEN_TYPE_UID).set({
        uid: ACH_BROKEN_TYPE_UID,
        name: 'Zepsuty typ',
        description: 'test',
        icon: 'medal',
        group: 'score',
        type: 'somethingNobodyImplemented',   // not in ACHIEVEMENT_TYPES
        target: 1,
        bonus: 1000
    });

    await db.collection('achievements').doc(ACH_BROKEN_TARGET_UID).set({
        uid: ACH_BROKEN_TARGET_UID,
        name: 'Zepsuty próg',
        description: 'test',
        icon: 'medal',
        group: 'score',
        type: 'points',
        target: '1',                          // string, not a number
        bonus: 1000
    });
}

// Location achievements (task #37) - mirrors seedAchievements above. `scope` is a pinScopeKeys.ts key
// (`map:<mapId>` / `group:<groupUid>`); `target` is DERIVED in production (recomputeAchievementTargets
// overwrites it), so the fixture seeds `0` and tests call the recompute themselves before asserting.
export const ACH_LOCATION_UID = 'test-location-achievement';

export async function seedScopedAchievement (scope, overrides = {}) {
    const def = {
        uid: ACH_LOCATION_UID,
        name: 'Testowy odkrywca',
        description: 'test',
        icon: 'map-pin',
        group: 'location',
        type: 'pinsInScope',
        scope,
        target: 0,
        bonus: 20,
        ...overrides
    };

    await db.collection('achievements').doc(def.uid).set(def);
    return def;
}

// A dedicated pair of pins for the location-achievement suite, kept SEPARATE from the general fixture
// pins above (which all share mapId 'test-map' / groups ['test']): that scope contains a pin outside
// its availability window, so "collect every active pin in the scope" can never complete there.
// These two are both `visit` type, always available, and isActive, so a test can exhaust the scope
// and observe the achievement actually grant.
export const LOC_SCOPE_MAP_ID = 'loc-test-map';
export const LOC_SCOPE_GROUP_UID = 'loc-test';
export const LOC_PIN_A_UID = 'loc-test-pin-a';
export const LOC_PIN_B_UID = 'loc-test-pin-b';

export async function seedLocationScopePins () {
    const base = {
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: [LOC_SCOPE_GROUP_UID],
        mapId: LOC_SCOPE_MAP_ID,
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    };

    await db.collection('pins').doc(LOC_PIN_A_UID).set({
        uid: LOC_PIN_A_UID, name: 'Loc pin A', coords: { x: 0, y: 0 }, ...base
    });
    await db.collection('pins').doc(LOC_PIN_B_UID).set({
        uid: LOC_PIN_B_UID, name: 'Loc pin B', coords: { x: 1, y: 1 }, ...base
    });
}

// #45: a feedback pin and a photo pin in the SAME scope as the pair above, raising its target from 2
// to 4. Opt-in - seeding these unconditionally would break every `target === 2` assertion.
export const LOC_PIN_FEEDBACK_UID = 'loc-test-pin-feedback';
export const LOC_PIN_PHOTO_UID = 'loc-test-pin-photo';

export async function seedLocationScopeExtraPins () {
    const base = {
        description: 'test pin',
        clue: '',
        groups: [LOC_SCOPE_GROUP_UID],
        mapId: LOC_SCOPE_MAP_ID,
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    };

    await db.collection('pins').doc(LOC_PIN_FEEDBACK_UID).set({
        uid: LOC_PIN_FEEDBACK_UID, name: 'Loc pin feedback', type: 'feedback', coords: { x: 2, y: 2 }, ...base
    });
    await db.collection('pins').doc(LOC_PIN_PHOTO_UID).set({
        uid: LOC_PIN_PHOTO_UID, name: 'Loc pin photo', type: 'photo', coords: { x: 3, y: 3 }, ...base
    });
}

// #60: a ghost pin carrying BOTH the loc scope's group and its mapId, to pin down the one asymmetry
// in pinScopeKeys - it must raise the group target but not the map one. Opt-in, same as the pair above.
export const LOC_PIN_GHOST_UID = 'loc-test-pin-ghost';
export const LOC_PIN_GHOST_CODE = 'LOCGHOST01';

export async function seedLocationScopeGhostPin () {
    await db.collection('pins').doc(LOC_PIN_GHOST_UID).set({
        uid: LOC_PIN_GHOST_UID,
        name: 'Loc pin ghost',
        description: 'test pin',
        clue: '',
        type: 'ghost',
        groups: [LOC_SCOPE_GROUP_UID],
        mapId: LOC_SCOPE_MAP_ID,
        coords: { x: 4, y: 4 },
        hintRadius: null,
        clueImage: null,
        value: 5,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: LOC_PIN_GHOST_CODE,
        collectedBy: {}
    });
}

/**
 * A fully-formed user doc written straight through the admin SDK, so a test can preset counters or
 * the achievements map (e.g. seed a score just below a cup threshold, or a malformed achievements
 * field to force the evaluator to throw). `overrides` shallow-merges over the baseline shape.
 */
export async function seedUser (uid, username, overrides = {}) {
    await db.collection('users').doc(uid).set({
        uid,
        username,
        score: 0,
        amountOfCollectedCards: 0,
        amountOfAnsweredQuestions: 0,
        amountOfCorrectAnswers: 0,
        amountOfCollectedPins: 0,
        achievements: {},
        role: 'user',
        memberOf: null,
        winnerInRound: null,
        updatedAt: FieldValue.serverTimestamp(),
        lastGuildChangeAt: Timestamp.fromDate(new Date('2020/01/01')),
        ...overrides
    });

    await db.collection('users-usernames').doc(canonicalUsername(username)).set({ uid });

    await db.collection('users').doc(uid)
        .collection('collectedQuestions').doc('collectedQuestions')
        .set({});
}

// Pin group taxonomy for the admin editor's dropdown/validation (task #14). Every fixture pin above
// tags itself 'test', so that group must exist or the (unrelated) pins suite's own fixture reads would
// be inconsistent with upsertPinHandle's validation rule.
export const PIN_GROUP_TEST_UID = 'test';
export const PIN_GROUP_OTHER_UID = 'inne';

export async function seedPinGroups () {
    const groups = [
        { uid: PIN_GROUP_TEST_UID, name: 'Test' },
        { uid: PIN_GROUP_OTHER_UID, name: 'Inne' }
    ];

    await Promise.all(groups.map((group) => db.collection('pinGroups').doc(group.uid).set(group)));
}

export async function seedFixture () {
    const now = Date.now();

    // Every suite gets the achievement definitions: the fixture's awards (max 25 pts / 1 correct
    // answer) stay below every threshold, so scoring/pins/counters/rounds must remain unaffected.
    await seedAchievements();

    // Every suite gets the pin group taxonomy too - the admin-pins suite needs it for validation,
    // and it costs the others nothing (nothing reads pinGroups outside upsertPinHandle).
    await seedPinGroups();

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

    await db.collection('pins').doc(PIN_CODE_UID).set({
        uid: PIN_CODE_UID,
        name: PIN_CODE_NAME,
        description: PIN_CODE_DESCRIPTION,
        clue: '',
        type: 'code',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 0, y: 0 },
        hintRadius: PIN_CODE_HINT_RADIUS,
        value: PIN_CODE_VALUE,
        withQuestion: true,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: PIN_CODE_CODE,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_RIDDLE_UID).set({
        uid: PIN_RIDDLE_UID,
        name: 'Test pin (riddle)',
        description: 'test pin',
        clue: 'What breathes fire?',
        type: 'riddle',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 10, y: 10 },
        hintRadius: null,
        value: PIN_RIDDLE_VALUE,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: PIN_RIDDLE_ANSWER,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_VISIT_UID).set({
        uid: PIN_VISIT_UID,
        name: 'Test pin (visit)',
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 20, y: 20 },
        hintRadius: null,
        value: PIN_VISIT_VALUE,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_FEEDBACK_UID).set({
        uid: PIN_FEEDBACK_UID,
        name: 'Test pin (feedback)',
        description: 'test pin',
        clue: '',
        type: 'feedback',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 30, y: 30 },
        hintRadius: null,
        value: PIN_FEEDBACK_VALUE,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    // A feedback pin with withQuestion: true - D3 requires it never draws one regardless of the flag.
    await db.collection('pins').doc(PIN_FEEDBACK_WITHQ_UID).set({
        uid: PIN_FEEDBACK_WITHQ_UID,
        name: 'Test pin (feedback, withQuestion)',
        description: 'test pin',
        clue: '',
        type: 'feedback',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 31, y: 31 },
        hintRadius: null,
        value: PIN_FEEDBACK_VALUE,
        withQuestion: true,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_PHOTO_UID).set({
        uid: PIN_PHOTO_UID,
        name: 'Test pin (photo)',
        description: 'test pin',
        clue: '',
        type: 'photo',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 40, y: 40 },
        hintRadius: null,
        value: PIN_PHOTO_VALUE,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    await db.collection('pins').doc(PIN_GHOST_UID).set({
        uid: PIN_GHOST_UID,
        name: 'Test pin (ghost)',
        description: 'test pin',
        clue: '',
        type: 'ghost',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 41, y: 41 },
        hintRadius: null,
        clueImage: PIN_GHOST_CLUE_IMAGE,
        value: PIN_GHOST_VALUE,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: PIN_GHOST_CODE,
        collectedBy: {}
    });

    // Outside its availability window: closed an hour ago.
    await db.collection('pins').doc(PIN_UNAVAILABLE_UID).set({
        uid: PIN_UNAVAILABLE_UID,
        name: 'Test pin (unavailable)',
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 50, y: 50 },
        hintRadius: null,
        value: PIN_UNAVAILABLE_VALUE,
        withQuestion: false,
        availableFrom: Timestamp.fromMillis(now - 2 * 60 * 60 * 1000),
        availableTo: Timestamp.fromMillis(now - 60 * 60 * 1000),
        isActive: true,
        code: null,
        collectedBy: {}
    });

    // Inactive code pin - getPins drops it; both collect paths report 'pin is not active' (decision 28).
    await db.collection('pins').doc(PIN_INACTIVE_UID).set({
        uid: PIN_INACTIVE_UID,
        name: 'Test pin (inactive)',
        description: 'test pin',
        clue: '',
        type: 'code',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 60, y: 60 },
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: false,
        code: PIN_INACTIVE_CODE,
        collectedBy: {}
    });

    // Active, opens in an hour - getPins returns it (window is filtered client-side).
    await db.collection('pins').doc(PIN_FUTURE_UID).set({
        uid: PIN_FUTURE_UID,
        name: 'Test pin (future)',
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 70, y: 70 },
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: Timestamp.fromMillis(now + 60 * 60 * 1000),
        availableTo: null,
        isActive: true,
        code: null,
        collectedBy: {}
    });

    // Active, inside a live window - carries real timestamps for the Pin.fromRaw round-trip assertion.
    await db.collection('pins').doc(PIN_WINDOWED_UID).set({
        uid: PIN_WINDOWED_UID,
        name: 'Test pin (windowed)',
        description: 'test pin',
        clue: '',
        type: 'visit',
        groups: ['test'],
        mapId: 'test-map',
        coords: { x: 80, y: 80 },
        hintRadius: null,
        value: 5,
        withQuestion: false,
        availableFrom: Timestamp.fromMillis(now - 60 * 60 * 1000),
        availableTo: Timestamp.fromMillis(now + 60 * 60 * 1000),
        isActive: true,
        code: null,
        collectedBy: {}
    });
}
