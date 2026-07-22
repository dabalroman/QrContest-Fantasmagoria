import { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Achievement from '@/models/Achievement';
import User from '@/models/User';
import AchievementIcon from '@/components/achievements/AchievementIcon';
import ProgressBar from '@/components/ProgressBar';
import { AchievementType } from '@/functions/src/types/achievement';

// Genitive plural - invariant in the "740 / 1000 X" framing, so it needs no number agreement.
const PROGRESS_UNIT: Record<AchievementType, ReactNode> = {
    points: null,
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
    const unit = PROGRESS_UNIT[achievement.type];

    return (
        <div
            className={
                'p-4 my-4 rounded-xl shadow-panel bg-panel-transparent backdrop-blur-md '
                + 'flex items-center gap-4 '
                + (unlocked ? '' : 'grayscale opacity-60')
            }
        >
            <div className="shrink-0 self-start pt-0.5 w-10 flex justify-center text-text-accent text-3xl">
                <AchievementIcon iconKey={achievement.icon}/>
            </div>
            <div className="grow text-left">
                <div className="flex justify-between items-baseline gap-2">
                    <h3 className="text-2xl font-semibold text-text-accent">{achievement.name}</h3>
                    <span className="text-xl font-bold text-text-accent whitespace-nowrap">
                        <FontAwesomeIcon icon={faStar} size="xs"/> {earned ? earned.bonus : achievement.bonus}
                    </span>
                </div>
                <p className="text-sm">{achievement.description}</p>
                {!earned && <div className="mt-2">
                    <ProgressBar
                        percentage={pct}
                        label={<>{current} / {target}{unit && <> {unit}</>}</>}
                    />
                </div>}
            </div>
        </div>
    );
}
