// End-to-end test harness against the local Firebase emulator.
//
// Nothing here is mocked: we mint a real ID token from the Auth emulator and POST to the
// callable functions exactly as the web client does, so every test exercises the real
// Firestore transactions and score fan-out. Requires `npm run emulators` to be running.
//
// No client SDK and no extra dependencies — just firebase-admin (already present) and
// Node's global fetch. Run with: npm test (in functions/).

import admin from 'firebase-admin';

// A `demo-` project id forces the emulator suite into full offline mode: the admin SDK inside
// functions auto-targets the emulators and never reaches for real GCP credentials. Running under
// the real project id (`qrcontest2023`) makes every in-function Firestore call hang ~60s on the
// GCE metadata server. Start the emulator with the matching id: `npm run emulators:test` (repo root).
export const PROJECT_ID = process.env.TEST_PROJECT_ID ?? 'demo-qrcontest';
export const REGION = 'europe-west1';

const FIRESTORE_HOST = '127.0.0.1:8080';
const AUTH_HOST = '127.0.0.1:9099';
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT_ID}/${REGION}`;

// Must be set before admin initializes so it targets the emulator, not the live project.
process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_HOST;
process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_HOST;
process.env.GCLOUD_PROJECT = PROJECT_ID;

if (admin.apps.length === 0) {
    admin.initializeApp({ projectId: PROJECT_ID });
}

export const db = admin.firestore();
export const auth = admin.auth();

/** Fail fast with a clear message if the emulator isn't up. */
export async function assertEmulatorReachable () {
    try {
        await fetch(`http://${FIRESTORE_HOST}/`);
    } catch {
        throw new Error(
            'Firebase emulator is not reachable on 127.0.0.1:8080. '
            + 'Start it first with `npm run emulators` (from the repo root).'
        );
    }
}

/** Wipe Firestore + Auth between tests for isolation. */
export async function resetEmulator () {
    await fetch(
        `http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
        { method: 'DELETE' }
    );
    await fetch(
        `http://${AUTH_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`,
        { method: 'DELETE' }
    );
}

/**
 * Create an auth user and return a usable ID token (as the client would hold after login).
 * Does NOT create the Firestore user doc — that's setupAccountHandle's job.
 */
export async function createAuthUserToken (uid) {
    await auth.createUser({ uid }).catch((e) => {
        if (e.code !== 'auth/uid-already-exists') throw e;
    });

    const customToken = await auth.createCustomToken(uid);

    const res = await fetch(
        `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: customToken, returnSecureToken: true })
        }
    );
    const body = await res.json();
    if (!body.idToken) {
        throw new Error('Failed to exchange custom token for ID token: ' + JSON.stringify(body));
    }
    return body.idToken;
}

/**
 * Invoke an onCall function over HTTP using the callable protocol.
 * Returns the unwrapped `result`. Throws an Error whose `.message` is the function's
 * HttpsError message (e.g. 'card is already collected'), mirroring what the client sees.
 */
export async function callCallable (name, data, idToken) {
    const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ data })
    });
    const body = await res.json().catch(() => ({}));

    if (body.error) {
        const err = new Error(body.error.message ?? body.error.status ?? 'callable error');
        err.status = body.error.status;
        throw err;
    }
    if (!res.ok) {
        throw new Error(`callable ${name} failed: HTTP ${res.status}`);
    }
    return body.result;
}
