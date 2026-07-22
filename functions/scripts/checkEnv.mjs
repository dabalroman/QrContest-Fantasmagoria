// Fails the functions build while functions/.env is missing or malformed.
//
// Must PARSE the file rather than read process.env: `npm run build` is plain tsc and never loads
// it - firebase-tools reads it at deploy/emulate time and injects it into the runtime.
//
// The entry-shape check is the point, not the emptiness check: `ADMIN_EMAILS=TODO` would otherwise
// pass the gate and leave nobody an admin, discovered only at the venue.

import parseEnvFile, { splitList } from './parseEnvFile.mjs';

const REQUIRED_KEYS = ['ADMIN_EMAILS', 'DASHBOARD_EMAILS'];
const EMAIL_RE = /^[^\s@"',]+@[^\s@"',]+\.[^\s@"',]+$/;

const parsed = parseEnvFile();
const problems = [];

if (parsed === null) {
    problems.push('functions/.env is missing');
} else {
    if (parsed.invalidLines.length > 0) {
        // firebase-tools' own parseStrict throws on these, so the deploy would abort later anyway.
        problems.push(`functions/.env has lines with no "=" (line ${parsed.invalidLines.join(', ')})`);
    }

    for (const key of REQUIRED_KEYS) {
        const entries = splitList(parsed.values[key]);

        if (entries.length === 0) {
            problems.push(`${key} is missing or empty`);
            continue;
        }

        const invalid = entries.filter((entry) => !EMAIL_RE.test(entry));

        if (invalid.length > 0) {
            problems.push(`${key} has entries that are not email addresses: ${invalid.join(', ')}`);
        }
    }
}

if (problems.length > 0) {
    console.error(
        '\n[checkEnv] the Cloud Functions env is not usable:\n'
        + problems.map((problem) => `  - ${problem}\n`).join('')
        + '\nCopy functions/.env.dist to functions/.env and fill in a comma-separated list of\n'
        + 'email addresses for ADMIN_EMAILS and DASHBOARD_EMAILS.\n'
    );
    process.exit(1);
}
