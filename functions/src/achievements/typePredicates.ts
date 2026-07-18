import { User } from '../types/user';
import { AchievementType } from '../types/achievement';

/**
 * The ONLY place achievement LOGIC lives: one counter accessor per type. Unlocking is always
 * `counter(user) >= definition.target`, which is why unlock and the #24 progress bar can never
 * disagree — they read the same number.
 *
 * Pure functions of the user doc: no Firestore, no transaction, no clock. Typed as a total Record
 * over AchievementType, so adding a type to the union without an accessor here is a compile error.
 */
export const TYPE_COUNTERS: Record<AchievementType, (user: User) => number> = {
    points: (user) => user.score,
    correctAnswers: (user) => user.amountOfCorrectAnswers
};
