import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/utils/firebase';
import { useCallback, useEffect, useState } from 'react';
import { PinsCacheContextType } from '@/utils/context';
import Pin from '@/models/Pin';
import CollectedPin from '@/models/CollectedPin';
import CollectionCache from '@/models/CollectionCache';
import { getPinsFunction } from '@/utils/functions';
import { collection, onSnapshot } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';

// The map is the first screen that both collects AND views pins at once, so - unlike the one-shot card
// cache - it must stay fresh. `pins` is admin-only read (the code is inline), so it cannot be a client
// listener; freshness is a poll + tab-focus refetch instead. Only `collectedPins` is a true listener.
const PINS_REFETCH_INTERVAL_MS = 15 * 60 * 1000;

export default function usePinsData (): PinsCacheContextType {
    const [authUser] = useAuthState(auth);
    const [pins, setPins] = useState<CollectionCache<Pin> | null>(null);
    const [collectedPins, setCollectedPins] = useState<CollectionCache<CollectedPin> | null>(null);
    const [pinsLoading, setPinsLoading] = useState<boolean>(false);
    const [pinsError, setPinsError] = useState<boolean>(false);

    // Freshness / failure-retry ONLY - never coupled to a collect. A player's own collect greys its
    // marker through the collectedPins listener below, so there is NO setCollectedPins(null) anywhere.
    const reloadPins = useCallback(() => {
        if (!auth.currentUser) {
            return;
        }

        setPinsLoading(true);
        setPinsError(false);

        getPinsFunction({})
            .then((result) => {
                setPins(new CollectionCache<Pin>(result.data.pins.map(Pin.fromRaw)));
                setPinsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setPinsError(true);
                setPinsLoading(false);
            });
    }, []);

    // pins: one-shot on login, then a 15-min poll + a refetch whenever the tab becomes visible.
    useEffect(() => {
        if (!authUser) {
            setPins(null);
            return;
        }

        reloadPins();

        const interval = window.setInterval(reloadPins, PINS_REFETCH_INTERVAL_MS);
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                reloadPins();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [authUser, reloadPins]);

    // collectedPins: a true live listener so the player's own collect greys the marker instantly.
    useEffect(() => {
        if (!authUser) {
            setCollectedPins(null);
            return;
        }

        return onSnapshot(
            collection(firestore, FireDoc.USERS, authUser.uid, FireDoc.USERS__COLLECTED_PINS)
                .withConverter(CollectedPin.getConverter()),
            (snapshot) => {
                const docs = snapshot.docs.map((doc) => doc.data()) as CollectedPin[];
                setCollectedPins(new CollectionCache<CollectedPin>(docs));
            }
        );
    }, [authUser]);

    return { pins, collectedPins, pinsLoading, pinsError, reloadPins };
}
