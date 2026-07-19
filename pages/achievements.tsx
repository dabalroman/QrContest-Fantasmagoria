import { useContext } from 'react';
import ScreenTitle from '@/components/ScreenTitle';
import Metatags from '@/components/Metatags';
import Panel from '@/components/Panel';
import Loader from '@/components/Loader';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import useAchievements from '@/hooks/useAchievements';
import { UserContext, UserContextType } from '@/utils/context';
import Achievement from '@/models/Achievement';
import AchievementComponent from '@/components/achievements/AchievementComponent';

export default function AchievementsPage () {
    useDynamicNavbar({});

    const { user } = useContext<UserContextType>(UserContext);
    const { achievements, loading } = useAchievements();

    const ready = !loading && user && achievements;

    // Flat list, no group headers: sort so same-type achievements cluster (by group) and each run
    // climbs its ladder (by target). Headers are deliberately deferred — this order makes them purely
    // additive later.
    const sorted = achievements
        ? [...achievements].sort((a: Achievement, b: Achievement) =>
            a.group.localeCompare(b.group) || a.target - b.target)
        : [];

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
