import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/utils/firebase';
import { useEffect, useState } from 'react';
import { UserContextType } from '@/utils/context';
import User from '@/models/User';
import toast from 'react-hot-toast';
import { doc, onSnapshot } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';

export default function useUserData (): UserContextType {
    const [authUser, authLoading]: [any, boolean, Error | undefined] = useAuthState(auth);
    const [user, setUser] = useState<User | null>(null);
    const [loadedForUid, setLoadedForUid] = useState<string | null>(null);

    // Keyed on the uid string, not the authUser object: a new object for the same account would
    // otherwise resubscribe and flip userLoading back to true, which is now a synchronous full-screen
    // Loader rather than an invisible post-effect blip.
    const authUid: string | null = authUser?.uid ?? null;

    useEffect(() => {
        if (!authUid) {
            setUser(null);
            setLoadedForUid(null);
            return;
        }

        try {
            return onSnapshot(doc(firestore, FireDoc.USERS, authUid)
                .withConverter(User.getConverter()), (snapshot) => {

                setUser((snapshot.data() as User) ?? null);
                setLoadedForUid(authUid);
            });
        } catch (e) {
            setUser(null);
            console.error(e);
            toast.error('Nie udało się zalogować!');
        }
    }, [authUid]);

    // Derived, never useState-plus-effect: state set inside an effect still reads "resolved, no
    // account" on the render authUser first appears, and the login pages route on exactly that.
    // The authUid null-check is load-bearing - a signed-out visitor never gets a snapshot, so without
    // it userLoading stays true forever and AuthCheck pins the whole app on a Loader.
    const userLoading = authUid !== null && loadedForUid !== authUid;
    const userReady = !userLoading && user !== null && user.username !== undefined;

    return {
        authUser,
        authLoading,
        user,
        userLoading,
        userReady
    };
}
