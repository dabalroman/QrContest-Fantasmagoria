import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/utils/firebase';
import { useEffect, useState } from 'react';
import { UserContextType } from '@/utils/context';
import User from '@/models/User';
import toast from 'react-hot-toast';
import { doc, onSnapshot } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';

export default function useUserData (): UserContextType {
    const [authUser, loading]: [any, boolean, Error | undefined] = useAuthState(auth);
    const [user, setUser] = useState<User | null>(null);
    const [userReady, setUserReady] = useState<boolean>(false);

    useEffect(() => {
        try {
            if (!authUser) {
                setUser(null);
                return;
            }

            return onSnapshot(doc(firestore, FireDoc.USERS, authUser?.uid ?? '')
                .withConverter(User.getConverter()), (snapshot) => {

                const restoredUser = snapshot.data() as User;
                if (user === null && restoredUser) {
                    console.log('Restored:', restoredUser);
                }

                setUser(restoredUser);
            });
        } catch (e) {
            setUser(null);
            console.error(e);
            toast.error('Nie udało się zalogować!');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

    useEffect(() => {
        setUserReady(user !== null && user?.username !== undefined);
    }, [user]);

    return {
        authUser,
        loading,
        user,
        userReady
    };
}
