import { Context, createContext } from 'react';
import User from '@/models/User';
import { User as FirebaseUser } from '@firebase/auth';

export type AuthUser = FirebaseUser;

export interface UserContextType {
    authUser: AuthUser | null,
    user: User | null,
    userReady: boolean,
    fetchUser: () => void
}

// @ts-ignore
export const UserContext: Context<UserContextType> = createContext({
    authUser: null,
    user: null,
    userReady: false,
    fetchUser: () => {}
});
