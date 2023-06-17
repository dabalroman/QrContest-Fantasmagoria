import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/utils/firebase';
import { User as AuthUser } from '@firebase/auth';
import { useEffect, useState } from 'react';
import { UserContextType } from '@/utils/context';
import User from '@/models/User';
import toast from 'react-hot-toast';
import { doc, onSnapshot } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';

export default function useUserData (): UserContextType {
    const [authUser] = useAuthState(auth) as any as [AuthUser | null];
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
    }, [authUser]);

    useEffect(() => {
        setUserReady(user !== null && user?.username !== undefined);
    }, [user]);

    return {
        authUser,
        user,
        userReady
    };
}
