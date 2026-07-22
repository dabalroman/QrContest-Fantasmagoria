import { Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { Achievement, ACHIEVEMENT_TYPES } from '../types/achievement';

const DEFAULT_TTL_MS = 60 * 1000;

// 60s in production: definitions are tiny and near-static, so a short TTL collapses ~10k reads into a
// handful while keeping "edit in the console and see it live" genuinely live - which is the whole
// point of definitions being data (there is no redeploy window mid-event). Under the emulator the TTL
// is 0 so the e2e suite reads fresh instead of fighting a stale in-process cache.
const ttlMs = Number(
    process.env.ACHIEVEMENTS_CACHE_TTL_MS
    ?? (process.env.FUNCTIONS_EMULATOR === 'true' ? 0 : DEFAULT_TTL_MS)
);

let cache: Achievement[] | null = null;
let loadedAt = 0;

/**
 * Loads the achievement definitions for the award path, cached.
 *
 * Never throws and never blocks scoring: if the fetch fails we log and serve the last-known-good
 * copy (or an empty list on a cold start), so a Firestore hiccup costs a badge, not a point.
 */
export default async function loadDefinitions(db: Firestore): Promise<Achievement[]> {
    const now = Date.now();

    if (cache !== null && now - loadedAt < ttlMs) {
        return cache;
    }

    try {
        const snapshot = await db.collection('achievements').get();

        cache = snapshot.docs
            .map((doc) => doc.data() as Achievement)
            .filter(isValidDefinition);
        loadedAt = now;
    } catch (error) {
        logger.error('ACHIEVEMENTS_LOAD_FAILED', error);
    }

    return cache ?? [];
}

/**
 * A definition is untrusted data - the compiler cannot vouch for a Firestore doc. An unknown `type`,
 * a `target` saved as the string "50", or a missing field would otherwise be a SILENT no-op that
 * looks shipped but isn't. So every reject is logged under a stable, alertable prefix.
 *
 * `target < 1` is rejected outright, not just for `pinsInScope`: `counter >= 0` is true for every
 * player on their FIRST award, so a zero-target definition would mass-grant event-wide, silently and
 * irreversibly. This is reachable for a `pinsInScope` def - a fresh seed before any pin exists leaves
 * its derived target at 0 until the first recompute.
 */
function isValidDefinition(definition: Achievement): boolean {
    const isValid = isNonEmptyString(definition?.uid)
        && isNonEmptyString(definition?.name)
        && isNonEmptyString(definition?.icon)
        && ACHIEVEMENT_TYPES.includes(definition?.type)
        && isFiniteNumber(definition?.target)
        && definition.target >= 1
        && isFiniteNumber(definition?.bonus)
        && (definition?.type !== 'pinsInScope' || isNonEmptyString(definition?.scope));

    if (!isValid) {
        logger.error('ACHIEVEMENTS_DEF_INVALID', {
            uid: definition?.uid ?? null,
            type: definition?.type ?? null,
            target: definition?.target ?? null,
            bonus: definition?.bonus ?? null
        });
    }

    return isValid;
}

function isNonEmptyString(value: unknown): boolean {
    return typeof value === 'string' && value.length > 0;
}

function isFiniteNumber(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
}
