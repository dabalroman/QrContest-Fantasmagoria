import { Context, createContext } from 'react';
import { User } from '@firebase/auth';

export interface UserContextType {
    user: User | null,
    username: string | null
}

// @ts-ignore
export const UserContext: Context<UserContextType> = createContext({
    user: null,
    username: null
});
