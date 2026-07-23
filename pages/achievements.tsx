import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTrophy } from '@fortawesome/free-solid-svg-icons';
import ScreenTitle from '@/components/ScreenTitle';
import Metatags from '@/components/Metatags';
import Panel from '@/components/Panel';
import Loader from '@/components/Loader';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import useAchievements from '@/hooks/useAchievements';
import { UserContext, UserContextType } from '@/utils/context';
import Achievement from '@/models/Achievement';
import AchievementComponent from '@/components/achievements/AchievementComponent';
import AchievementIcon from '@/components/achievements/AchievementIcon';
import ProgressBar from '@/components/ProgressBar';

export default function AchievementsPage () {
    useDynamicNavbar({});

    const { user } = useContext<UserContextType>(UserContext);
    const { achievements, loading } = useAchievements();

    const ready = !loading && user && achievements;

    // Flat list, no group headers: sort by the authored `order` (blocks of 100 per category, see
    // achievementsSeed.ts), then by target so a same-order tie still climbs its ladder. Headers are
    // deliberately deferred - this order makes them purely additive later.
    const sorted = achievements
        ? [...achievements].sort((a: Achievement, b: Achievement) =>
            a.order - b.order || a.target - b.target)
        : [];

    // Sums the STORED grant bonus, never the definition's current one - retuning a definition later
    // must not rewrite what a player was actually awarded.
    const total = achievements?.length ?? 0;
    const unlocked = ready ? achievements.filter((a: Achievement) => a.isUnlockedBy(user)).length : 0;
    const bonusTotal = user
        ? Object.values(user.achievements).reduce((sum: number, grant) => sum + grant.bonus, 0)
        : 0;
    const unlockedPct = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    const lastUnlocked = ready
        ? achievements
            .filter((a: Achievement) => a.isUnlockedBy(user))
            .sort((a: Achievement, b: Achievement) =>
                user.achievements[b.uid].grantedAt.getTime() - user.achievements[a.uid].grantedAt.getTime())[0]
        : undefined;

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Osiągnięcia"/>
            <ScreenTitle>Osiągnięcia</ScreenTitle>
            {!ready && <Loader/>}
            {ready && (
                sorted.length === 0
                    ? <Panel title="Wkrótce">
                        <p>Osiągnięcia pojawią się tutaj już niedługo. Zbieraj punkty i wracaj po nagrody!</p>
                    </Panel>
                    : <div>
                        <Panel title="Twoje postępy">
                            <p className="mb-4 text-justify">
                                Tu lądują dowody Twoich wyczynów. Każde osiągnięcie to dodatkowe punkty,
                                więc zbieraj, odpowiadaj i zwiedzaj.
                            </p>
                            <div className="flex place-content-around text-3xl text-text-accent mb-4">
                                <div>
                                    <FontAwesomeIcon className="px-1" icon={faTrophy} size="sm"/>
                                    &nbsp;{unlocked} / {total}
                                </div>
                                <div>
                                    <FontAwesomeIcon className="px-1" icon={faStar} size="sm"/>
                                    &nbsp;{bonusTotal}
                                </div>
                            </div>
                            <ProgressBar percentage={unlockedPct} label={`${unlockedPct}%`}/>
                            {lastUnlocked &&
                                <p className="mt-3 text-center">
                                    Ostatnio zdobyte:
                                    <AchievementIcon iconKey={lastUnlocked.icon} className="mx-2"/>
                                    <b>{lastUnlocked.name}</b>
                                </p>
                            }
                        </Panel>
                        {sorted.map((achievement: Achievement) => (
                            <AchievementComponent
                                key={achievement.uid}
                                achievement={achievement}
                                user={user}
                            />
                        ))}
                    </div>
            )}
        </main>
    );
}
