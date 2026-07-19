import { useEffect, useState } from 'react';
import { collection, getDocs, query, QuerySnapshot } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import Achievement from '@/models/Achievement';

// Fetch-on-mount, deliberately NOT parked in a session-wide context (unlike useCollectedCards /
// CardsCacheContext). Definitions are data so a threshold can be retuned in the Firestore console
// mid-event; refetching on every mount of /achievements — 9 tiny docs — self-heals such an edit on
// the next screen open. `user.achievements` + counters still arrive live via useUserData, so a new
// unlock shows immediately without any refetch here.
export default function useAchievements () {
    const [achievements, setAchievements] = useState<Achievement[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const achievementsQuery = query(collection(firestore, FireDoc.ACHIEVEMENTS))
            .withConverter(Achievement.getConverter());

        getDocs(achievementsQuery)
            .then((querySnapshot: QuerySnapshot) => {
                setAchievements(querySnapshot.docs.map((doc: any) => doc.data()) as Achievement[]);
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
