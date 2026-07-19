// Admin pin editor (task #14) — upsertPinHandle + deletePinHandle. Mirrors pins.test.mjs: mints real
// ID tokens, POSTs to the actual callables, and asserts against real Firestore documents. The
// load-bearing assertion is that an edit (or a re-seed) can never wipe a pin's collectedBy finder map.

import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
    db, assertEmulatorReachable, resetEmulator, createAuthUserToken, callCallable
} from './emulator.mjs';
import {
    seedFixture, seedUser,
    PIN_CODE_UID, PIN_CODE_CODE, PIN_CODE_VALUE, PIN_CODE_NAME,
    PIN_RIDDLE_UID,
    PIN_GROUP_TEST_UID
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

// Written straight through the admin SDK (bypasses setupAccountHandle), same idiom as
// counters.test.mjs's seedLegacyUser — the assertAdmin guard only needs a user doc with role: 'admin'.
async function registerAdmin (uid, username) {
    const token = await createAuthUserToken(uid);
    await seedUser(uid, username, { role: 'admin' });
    return token;
}

function validFields (overrides = {}) {
    return {
        name: 'Testowa pinezka',
        description: 'opis',
        clue: '',
        type: 'visit',
        groups: [PIN_GROUP_TEST_UID],
        mapId: 'dwor',
        coords: { x: 100, y: 200 },
        hintRadius: null,
        value: 10,
        withQuestion: false,
        availableFrom: null,
        availableTo: null,
        isActive: true,
        code: null,
        ...overrides
    };
}

// --- auth / admin guard ---

test('upsertPinHandle requires auth', async () => {
    await assert.rejects(
        () => callCallable('upsertPinHandle', { pinUid: null, fields: validFields() }, null),
        /permission/i
    );
});

test('deletePinHandle requires auth', async () => {
    await assert.rejects(
        () => callCallable('deletePinHandle', { pinUid: PIN_CODE_UID }, null),
        /permission/i
    );
});

test('upsertPinHandle rejects a non-admin', async () => {
    const token = await registerPlayer('non-admin-1', 'NonAdmin1');
    await assert.rejects(
        () => callCallable('upsertPinHandle', { pinUid: null, fields: validFields() }, token),
        /permission/i
    );
});

test('deletePinHandle rejects a non-admin', async () => {
    const token = await registerPlayer('non-admin-2', 'NonAdmin2');
    await assert.rejects(
        () => callCallable('deletePinHandle', { pinUid: PIN_CODE_UID }, token),
        /permission/i
    );
});

// --- create ---

test('upsert creates a new pin, visible via getPins, response strips code/collectedBy', async () => {
    const adminToken = await registerAdmin('admin-1', 'Admin1');

    const result = await callCallable(
        'upsertPinHandle',
        { pinUid: null, fields: validFields({ name: 'Nowa pinezka', type: 'code', code: 'NEWCODE001' }) },
        adminToken
    );

    assert.equal(result.pin.uid, 'nowa-pinezka');
    assert.equal(result.pin.code, undefined, 'response must not carry the code');
    assert.equal(result.pin.collectedBy, undefined, 'response must not carry collectedBy');

    const doc = (await db.collection('pins').doc('nowa-pinezka').get()).data();
    assert.equal(doc.code, 'NEWCODE001');
    assert.deepEqual(doc.collectedBy, {});

    const playerToken = await registerPlayer('viewer-1', 'Viewer1');
    const { pins } = await callCallable('getPinsHandle', {}, playerToken);
    assert.ok(pins.some((pin) => pin.uid === 'nowa-pinezka'), 'new active pin returned by getPins');
});

test('creating a pin whose derived uid already exists is rejected', async () => {
    const adminToken = await registerAdmin('admin-10', 'Admin10');
    await assert.rejects(
        () => callCallable(
            'upsertPinHandle',
            { pinUid: null, fields: validFields({ name: PIN_CODE_NAME }) },
            adminToken
        ),
        /already/i
    );
});

// --- update preserves collectedBy (load-bearing) ---

test('upsert update preserves collectedBy', async () => {
    const adminToken = await registerAdmin('admin-2', 'Admin2');
    const playerToken = await registerPlayer('finder-1', 'Finder1');

    await callCallable('collectPinHandle', { code: PIN_CODE_CODE }, playerToken);

    await callCallable(
        'upsertPinHandle',
        {
            pinUid: PIN_CODE_UID,
            fields: validFields({
                name: 'Zmieniona nazwa',
                type: 'code',
                code: PIN_CODE_CODE,
                value: PIN_CODE_VALUE + 5
            })
        },
        adminToken
    );

    const doc = (await db.collection('pins').doc(PIN_CODE_UID).get()).data();
    assert.equal(doc.name, 'Zmieniona nazwa');
    assert.equal(doc.value, PIN_CODE_VALUE + 5);
    assert.ok(doc.collectedBy['finder-1'], 'the finder must survive the edit');
});

// --- re-seeding preserves collectedBy (the §5 fix, same shape as above) ---

test('re-seeding preserves a pin\'s collectedBy', async () => {
    const adminToken = await registerAdmin('admin-reseed', 'AdminReseed');

    // First real seed, so the production pin/card content exists.
    await callCallable('seedDatabaseHandle', { password: '4064' }, adminToken);

    const playerToken = await registerPlayer('reseed-finder', 'ReseedFinder');
    await callCallable('collectPinHandle', { code: 'SMOK000001' }, playerToken);

    // Re-seed — must NOT wipe the finder (seedPins now uses set(pin, { merge: true })).
    await callCallable('seedDatabaseHandle', { password: '4064' }, adminToken);

    const pin = (await db.collection('pins').doc('smocze-leze').get()).data();
    assert.ok(pin.collectedBy['reseed-finder'], 'collectedBy must survive a re-seed');
});

// --- duplicate code ---

test('duplicate code on a different uid is rejected; re-saving a pin\'s own code is fine', async () => {
    const adminToken = await registerAdmin('admin-3', 'Admin3');

    await assert.rejects(
        () => callCallable(
            'upsertPinHandle',
            { pinUid: null, fields: validFields({ name: 'Kolizja', type: 'code', code: PIN_CODE_CODE }) },
            adminToken
        ),
        /already/i
    );

    const result = await callCallable(
        'upsertPinHandle',
        { pinUid: PIN_CODE_UID, fields: validFields({ name: PIN_CODE_NAME, type: 'code', code: PIN_CODE_CODE }) },
        adminToken
    );
    assert.equal(result.pin.uid, PIN_CODE_UID);
});

// --- invalid payloads ---

test('an unknown mapId is rejected', async () => {
    const adminToken = await registerAdmin('admin-4', 'Admin4');
    await assert.rejects(
        () => callCallable(
            'upsertPinHandle',
            { pinUid: null, fields: validFields({ mapId: 'nieznana-mapa' }) },
            adminToken
        ),
        /invalid/i
    );
});

test('a group not present in pinGroups is rejected', async () => {
    const adminToken = await registerAdmin('admin-5', 'Admin5');
    await assert.rejects(
        () => callCallable(
            'upsertPinHandle',
            { pinUid: null, fields: validFields({ groups: ['nieznana-grupa'] }) },
            adminToken
        ),
        /invalid/i
    );
});

test('an unknown pin type is rejected', async () => {
    const adminToken = await registerAdmin('admin-6', 'Admin6');
    await assert.rejects(
        () => callCallable(
            'upsertPinHandle',
            { pinUid: null, fields: validFields({ type: 'not-a-type' }) },
            adminToken
        ),
        /invalid/i
    );
});

test('a malformed code is rejected for a code pin', async () => {
    const adminToken = await registerAdmin('admin-7', 'Admin7');
    await assert.rejects(
        () => callCallable(
            'upsertPinHandle',
            { pinUid: null, fields: validFields({ type: 'code', code: 'short' }) },
            adminToken
        ),
        /invalid/i
    );
});

// --- isActive / delete ---

test('an inactive pin created via the editor is absent from getPins', async () => {
    const adminToken = await registerAdmin('admin-8', 'Admin8');
    await callCallable(
        'upsertPinHandle',
        { pinUid: null, fields: validFields({ name: 'Nieaktywna', isActive: false }) },
        adminToken
    );

    const playerToken = await registerPlayer('viewer-2', 'Viewer2');
    const { pins } = await callCallable('getPinsHandle', {}, playerToken);
    assert.ok(!pins.some((pin) => pin.uid === 'nieaktywna'), 'inactive pin must not be returned');
});

test('delete removes the pin', async () => {
    const adminToken = await registerAdmin('admin-9', 'Admin9');
    await callCallable('deletePinHandle', { pinUid: PIN_RIDDLE_UID }, adminToken);

    const doc = await db.collection('pins').doc(PIN_RIDDLE_UID).get();
    assert.equal(doc.exists, false);
});
