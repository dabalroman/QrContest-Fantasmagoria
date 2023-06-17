import { Context, createContext } from 'react';
import User from '@/models/User';
import { User as FirebaseUser } from '@firebase/auth';
import CollectionCache from '@/models/CollectionCache';
import Card from '@/models/Card';

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

export interface CardsCacheContextType {
    cards: CollectionCache<Card> | null,
    setCards: (cardsCache: CollectionCache<Card> | null) => void
}

// @ts-ignore
export const CardsCacheContext: Context<CardsCacheContextType> = createContext({
    cards: null,
    setCards: () => {}
});
