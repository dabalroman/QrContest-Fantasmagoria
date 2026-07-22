import FirebaseModel from '@/models/FirebaseModel';
import { DocumentSnapshot, SnapshotOptions } from '@firebase/firestore';
import { Uid } from '@/types/global';
import User from '@/models/User';
import { AchievementType } from '@/functions/src/types/achievement';

// Mirrors functions/src/achievements/typePredicates.ts. Unlocking is decided server-side and is never
// trusted from here - this exists so a LOCKED achievement can render a progress bar against the same
// counter the server thresholds on, which is why the two must stay in step.
const TYPE_COUNTERS: Record<AchievementType, (user: User, achievement: Achievement) => number> = {
    points: (user) => user.score,
    correctAnswers: (user) => user.amountOfCorrectAnswers,
    pinsInScope: (user, achievement) => user.collectedPinsByScope[achievement.scope ?? ''] ?? 0
};

export default class Achievement extends FirebaseModel {
    uid: Uid;
    name: string;
    description: string;
    icon: string;
    group: string;
    type: AchievementType;
    target: number;
    bonus: number;
    // Only meaningful for type === 'pinsInScope' - a pinScopeKeys.ts scope key. See
    // functions/src/actions/recomputeAchievementTargets.ts.
    scope?: string;

    constructor (
        uid: Uid,
        name: string = '',
        description: string = '',
        icon: string = '',
        group: string = '',
        type: AchievementType = 'points',
        target: number = 0,
        bonus: number = 0,
        scope?: string
    ) {
        super();

        this.uid = uid;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.group = group;
        this.type = type;
        this.target = target;
        this.bonus = bonus;
        this.scope = scope;
    }

    protected static toFirestore (data: Achievement): object {
        throw new Error('Achievement is immutable.');
    }

    protected static fromFirestore (
        snapshot: DocumentSnapshot,
        options: SnapshotOptions
    ): Achievement {
        const data = snapshot.data(options);

        if (data === undefined) {
            throw new Error('Data undefined');
        }

        return new Achievement(
            data.uid,
            data.name,
            data.description,
            data.icon,
            data.group,
            data.type,
            data.target,
            data.bonus,
            data.scope
        );
    }

    public isUnlockedBy (user: User): boolean {
        return this.uid in user.achievements;
    }

    /** Current/target for a progress bar. Capped at the target so an unlocked bar never overflows. */
    public progressFor (user: User): { current: number, target: number } {
        const counter = TYPE_COUNTERS[this.type];

        return {
            current: Math.min(counter ? counter(user, this) : 0, this.target),
            target: this.target
        };
    }
}
