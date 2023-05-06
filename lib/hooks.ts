import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@/lib/firebase';
import { User } from '@firebase/auth';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from '@firebase/firestore';
import { UserContextType } from '@/lib/context';

export function useUserData (): UserContextType {
    const [user] = useAuthState(auth) as any as [User | null];
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe;

        if (user) {
            const ref = doc(firestore, 'users', user.uid);
            unsubscribe = onSnapshot(ref, (doc) => {
                setUsername(doc.data()?.username ?? '');
            });
        } else {
            setUsername(null);
        }

        return unsubscribe;
    }, [user]);

    return {
        user,
        username
    };
}
