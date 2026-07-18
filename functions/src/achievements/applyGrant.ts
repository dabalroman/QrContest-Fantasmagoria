import { User } from '../types/user';
import { DocumentReference, FieldValue, Transaction, UpdateData } from 'firebase-admin/firestore';
import { AchievementGrant } from '../types/achievement';

/**
 * The ONLY writer of an achievement grant. Stamps `achievements.<uid>` on the user doc; that entry IS
 * the exactly-once dup guard read back by evaluateAchievements. Runs OUTSIDE the evaluator's
 * try/catch — the evaluator is pure and only computes the list.
 *
 * `bonus` records what was actually awarded, so editing a definition later cannot rewrite history.
 * The points themselves are folded into awardPoints' single score write; this records the badge alone.
 */
export default function applyGrant(
    transaction: Transaction,
    userRef: DocumentReference<User>,
    grant: AchievementGrant
): void {
    transaction.update<User, User>(userRef, {
        [`achievements.${grant.uid}`]: {
            grantedAt: FieldValue.serverTimestamp(),
            bonus: grant.bonus
        }
    } as UpdateData<User>);
}
