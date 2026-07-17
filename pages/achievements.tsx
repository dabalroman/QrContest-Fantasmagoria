import ScreenTitle from '@/components/ScreenTitle';
import Metatags from '@/components/Metatags';
import Panel from '@/components/Panel';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';

export default function AchievementsPage () {
    useDynamicNavbar({});

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Osiągnięcia"/>
            <ScreenTitle>Osiągnięcia</ScreenTitle>
            <div>
                <Panel title="Wkrótce">
                    <p>Osiągnięcia pojawią się tutaj już niedługo. Zbieraj punkty i wracaj po nagrody!</p>
                </Panel>
            </div>
        </main>
    );
}
