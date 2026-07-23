import { useEffect, useState } from 'react';
import { collection, getDocs, query, QuerySnapshot } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import Achievement from '@/models/Achievement';

// Fetch-on-mount, deliberately NOT parked in a session-wide context (unlike useCollectedCards /
// CardsCacheContext). Definitions are data so most fields can still be retuned in the Firestore
// console mid-event with no redeploy (name/description/bonus/etc. - see achievementsSeed.ts); a
// `pinsInScope` definition's `target` is the one exception, since it is DERIVED and gets silently
// overwritten on the next pin-set change (task #37, recomputeAchievementTargets). Refetching on every
// mount of /achievements - a couple dozen tiny docs - self-heals such an edit on the next screen open.
// `user.achievements` + counters still arrive live via useUserData, so a new unlock shows immediately
// without any refetch here.
export default function useAchievements () {
    const [achievements, setAchievements] = useState<Achievement[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const achievementsQuery = query(collection(firestore, FireDoc.ACHIEVEMENTS))
            .withConverter(Achievement.getConverter());

        getDocs(achievementsQuery)
            .then((querySnapshot: QuerySnapshot) => {
                const definitions = querySnapshot.docs.map((doc: any) => doc.data()) as Achievement[];

                // Mirror the server's grant rule (functions/src/achievements/loadDefinitions.ts): a
                // definition with target < 1 can never unlock - `counter >= 0` holds for everyone, so
                // the server refuses it outright. A DERIVED `pinsInScope` target sits at 0 whenever its
                // scope has no active pins (an empty `type:`/`map:`/`group:` scope), so hide those:
                // an unachievable badge must not show, nor inflate the completion-% denominator.
                setAchievements(definitions.filter((achievement: Achievement) => achievement.target >= 1));
            })
            .catch(() => {
                setAchievements([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { achievements, loading };
}
