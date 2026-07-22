import { User } from '../types/user';
import { DocumentReference, FieldValue, Transaction, UpdateData } from 'firebase-admin/firestore';
import { AchievementGrant } from '../types/achievement';

/**
 * The ONLY writer of an achievement grant. Stamps `achievements.<uid>` on the user doc; that entry IS
 * the exactly-once dup guard read back by evaluateAchievements. Runs OUTSIDE the evaluator's
 * try/catch - the evaluator is pure and only computes the list.
 *
 * `bonus` records what was actually awarded, so editing a definition later cannot rewrite history.
 * The points themselves are folded into awardPoints' single score write; this records the badge alone.
 */
export default function applyGrant(
    transaction: Transaction,
    userRef: DocumentReference<User>,
    grant: AchievementGrant
): void {
    // Cast through `unknown`: adding `collectedPinsByScope` (an open Record<string, number>) to User
    // makes UpdateData<User>'s dotted-path union ambiguous enough that TS refuses the direct cast,
    // even though this dynamic `achievements.${uid}` key is a perfectly valid dotted path at runtime.
    transaction.update<User, User>(userRef, {
        [`achievements.${grant.uid}`]: {
            grantedAt: FieldValue.serverTimestamp(),
            bonus: grant.bonus
        }
    } as unknown as UpdateData<User>);
}
