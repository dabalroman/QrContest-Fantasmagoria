// Minimal dotenv parser, kept deliberately compatible with the one firebase-tools applies to
// functions/.env at deploy/emulate time (node_modules/firebase-tools/lib/functions/env.js): the
// optional `export` prefix and whole-value quoting are both legal there, so rejecting them here
// would block builds on a file that deploys fine.
//
// Shared by checkEnv.mjs (the prebuild gate) and test/setup-account.test.mjs so the gate, the
// runtime and the tests can never disagree about what the file says.

import { readFileSync } from 'node:fs';

export const ENV_PATH = new URL('../.env', import.meta.url);

function unquote (value) {
    const match = value.match(/^(["'])([\s\S]*)\1$/);

    return match ? match[2] : value;
}

/** Returns { values, invalidLines }, or null when the file does not exist. */
export default function parseEnvFile (path = ENV_PATH) {
    let raw;

    try {
        raw = readFileSync(path, 'utf8');
    } catch {
        return null;
    }

    const values = {};
    const invalidLines = [];

    raw.split('\n').forEach((line, index) => {
        const trimmed = line.trim();

        if (trimmed.length === 0 || trimmed.startsWith('#')) {
            return;
        }

        const separator = trimmed.indexOf('=');

        if (separator === -1) {
            invalidLines.push(index + 1);
            return;
        }

        const key = trimmed.slice(0, separator).trim().replace(/^export\s+/, '');

        values[key] = unquote(trimmed.slice(separator + 1).trim());
    });

    return { values, invalidLines };
}

/** Split a comma-separated env value into normalized, non-empty entries. */
export function splitList (value) {
    return (value ?? '')
        .split(',')
        .map((entry) => unquote(entry.trim()).trim().toLowerCase())
        .filter((entry) => entry.length > 0);
}
