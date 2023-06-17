import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/utils/firebase';
import { User as AuthUser } from '@firebase/auth';
import { useEffect, useState } from 'react';
import { UserContextType } from '@/utils/context';
import User from '@/models/User';
import toast from 'react-hot-toast';

export default function useUserData (): UserContextType {
    const [authUser] = useAuthState(auth) as any as [AuthUser | null];
    const [user, setUser] = useState<User | null>(null);
    const [userReady, setUserReady] = useState<boolean>(false);

    useEffect(() => {
        restoreSession()
             .then();
    }, [authUser]);

    useEffect(() => {
        setUserReady(user !== null && user?.username !== undefined);
    }, [user]);

    const restoreSession = async (): Promise<void> => {
        try {
            const restoredUser = await fetchUser();

            if(restoredUser === null) {
                return;
            }

            console.log('Restored:', restoredUser);
            toast.success(`Witaj ponownie, ${restoredUser.username}!`);
        } catch (e) {
            console.error(e);
            toast.error('Nie udało się zalogować!');
        }
    };

    const fetchUser = async (): Promise<User | null> => {
        if (!authUser) {
            setUser(null);
            return null;
        }

        try {
            const user = await User.fromUid(authUser.uid);
            setUser(user);
            return user;
        } catch (e) {
            setUser(null);
            throw e;
        }
    };

    return {
        authUser,
        user,
        userReady,
        fetchUser
    };
}
