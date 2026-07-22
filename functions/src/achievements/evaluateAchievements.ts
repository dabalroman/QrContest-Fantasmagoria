import { User } from '../types/user';
import { Achievement, AchievementGrant } from '../types/achievement';
import { TYPE_COUNTERS } from './typePredicates';

/**
 * PURE achievement evaluator (rule 1). Given the user and the loaded definitions it returns the
 * achievements to grant this award. It performs NO Firestore reads or writes, touches no transaction,
 * and does NOT mutate the caller's `user` - awardPoints applies the returned LIST afterwards.
 *
 * That separation is load-bearing, not stylistic: because nothing here is applied, a throw mid-loop
 * cannot half-grant an achievement or leave `user.score` inflated relative to the fan-out. The worst
 * case is a swallowed error and a badge that lands one award later.
 *
 * Exactly-once (rule 2) is enforced by recording each grant on local state BEFORE the next iteration:
 * `granted` guards against re-granting, and `working.score` lets a bonus cascade into a higher
 * `points` target within the same award.
 */
export default function evaluateAchievements(
    user: User,
    definitions: Achievement[]
): AchievementGrant[] {
    const grants: AchievementGrant[] = [];
    const granted = new Set<string>();

    // Shallow copy: only `score` is advanced, and the caller's user is left untouched. Reading
    // `user.achievements` also throws here if the field is malformed - a failure awardPoints swallows.
    const working: User = { ...user };

    const isUnlocked = (uid: string): boolean => granted.has(uid) || (uid in user.achievements);

    // Fixpoint: each pass grants at least one previously-ungranted achievement, and the set is finite
    // and exactly-once, so the loop is bounded by the number of definitions. The cap is a BACKSTOP
    // against a logic bug, not the safety mechanism.
    const cap = definitions.length + 1;

    for (let pass = 0; pass < cap; pass++) {
        let grantedThisPass = false;

        for (const definition of definitions) {
            if (isUnlocked(definition.uid)) {
                continue;
            }

            // Validated by loadDefinitions; the guard keeps a bad doc from throwing on the hot path.
            const counter = TYPE_COUNTERS[definition.type];

            if (!counter || counter(working, definition) < definition.target) {
                continue;
            }

            granted.add(definition.uid);
            working.score += definition.bonus;
            grants.push({
                uid: definition.uid,
                name: definition.name,
                icon: definition.icon,
                bonus: definition.bonus
            });
            grantedThisPass = true;
        }

        if (!grantedThisPass) {
            break;
        }
    }

    return grants;
}
