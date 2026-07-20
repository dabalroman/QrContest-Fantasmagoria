import { Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { Achievement } from '../types/achievement';
import { Pin } from '../types/pin';
import scopeKeys from './pinScopeKeys';

/**
 * Recomputes the DERIVED `target` field on every `pinsInScope` achievement definition — the
 * denominator to the player's `collectedPinsByScope[scope]` numerator.
 *
 * EVERY pin type counts, matching the award path, which increments the numerator for every type a
 * player can complete (`photo` only once an admin approves it). Filtering by type here is what
 * caused #45: the numerator counted `feedback`/`photo`, this did not, and badges unlocked early.
 *
 * Enumerates from the DEFINITIONS, not from a hardcoded map/group list: for each `pinsInScope` doc,
 * counts active pins whose scope keys include that doc's `scope`. A pin contributes iff
 * `isActive === true` — `availableFrom`/`availableTo` are ignored on purpose, the achievement tracks
 * the eventual full set, not what happens to be live right now.
 *
 * CRITICAL: must NEVER throw. Called from inside upsertPinHandle's success path, where the
 * surrounding catch would otherwise report a successfully-saved pin as 'error while saving pin'.
 */
export default async function recomputeAchievementTargets(db: Firestore): Promise<void> {
    try {
        const pinsSnapshot = await db.collection('pins').get();
        const counts: Record<string, number> = {};

        pinsSnapshot.docs.forEach((doc) => {
            const pin = doc.data() as Pin;

            if (!pin.isActive) {
                return;
            }

            scopeKeys(pin).forEach((key) => {
                counts[key] = (counts[key] ?? 0) + 1;
            });
        });

        const achievementsSnapshot = await db.collection('achievements').get();
        const scopedDefinitions = achievementsSnapshot.docs
            .map((doc) => doc.data() as Achievement)
            .filter((definition) => definition.type === 'pinsInScope');

        await Promise.all(scopedDefinitions.map((definition) => {
            const target = counts[definition.scope ?? ''] ?? 0;

            if (target === 0) {
                logger.warn('ACHIEVEMENT_TARGET_EMPTY_SCOPE', {
                    uid: definition.uid,
                    scope: definition.scope ?? null
                });
            }

            return db.collection('achievements')
                .doc(definition.uid)
                .set({ target }, { merge: true });
        }));
    } catch (error) {
        logger.error('ACHIEVEMENT_TARGETS_RECOMPUTE_FAILED', error);
    }
}
