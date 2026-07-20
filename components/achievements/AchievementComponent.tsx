import Achievement from '@/models/Achievement';
import User from '@/models/User';
import AchievementIcon from '@/components/achievements/AchievementIcon';
import { AchievementType } from '@/functions/src/types/achievement';

// Genitive-plural unit copy per achievement type, for the "740 / 1000 punktów" progress label.
const PROGRESS_UNIT: Record<AchievementType, string> = {
    points: 'punktów',
    correctAnswers: 'poprawnych odpowiedzi',
    pinsInScope: 'odwiedzonych miejsc'
};

export default function AchievementComponent ({
    achievement,
    user
}: { achievement: Achievement, user: User }) {
    // The server is the source of truth for a grant: presence in user.achievements decides state,
    // never the progress bar. `earned` is the actual grant record ({ grantedAt, bonus }) or undefined.
    const unlocked = achievement.isUnlockedBy(user);
    const earned = user.achievements[achievement.uid];

    const { current, target } = achievement.progressFor(user);
    const pct = target > 0 ? Math.round((current / target) * 100) : 0;

    return (
        <div
            className={
                'p-4 my-4 rounded-xl shadow-panel bg-panel-transparent backdrop-blur-md '
                + 'flex items-center gap-4 '
                + (unlocked ? '' : 'grayscale opacity-60')
            }
        >
            <div className="shrink-0 w-16 flex items-center justify-center text-text-accent">
                <AchievementIcon iconKey={achievement.icon} className="w-12 h-12"/>
            </div>
            <div className="grow text-left">
                <div className="flex justify-between items-baseline gap-2">
                    <h3 className="text-2xl font-semibold text-text-accent">{achievement.name}</h3>
                    <span className="text-xl font-bold text-text-accent whitespace-nowrap">
                        +{earned ? earned.bonus : achievement.bonus}
                    </span>
                </div>
                <p className="text-sm">{achievement.description}</p>
                {!earned && <div className="mt-2">
                    <div className="h-3 w-full rounded-full bg-text-accent/20 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-text-accent"
                            style={{ width: pct + '%' }}
                        />
                    </div>
                    <p className="text-sm mt-1 text-right">
                        {current} / {target} {PROGRESS_UNIT[achievement.type]}
                    </p>
                </div>}
            </div>
        </div>
    );
}
