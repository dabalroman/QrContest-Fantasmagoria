import { Context, createContext } from 'react';
import User from '@/models/User';
import { User as FirebaseUser } from '@firebase/auth';
import CollectionCache from '@/models/CollectionCache';
import Card from '@/models/Card';
import CardSet from '@/models/CardSet';

export type AuthUser = FirebaseUser;

export interface UserContextType {
    authUser: AuthUser | null,
    user: User | null,
    userReady: boolean
}

// @ts-ignore
export const UserContext: Context<UserContextType> = createContext({
    authUser: null,
    user: null,
    userReady: false
});

export interface CardsCacheContextType {
    cards: CollectionCache<Card> | null,
    setCards: (cardsCache: CollectionCache<Card> | null) => void,
    cardSets: CollectionCache<CardSet> | null,
    setCardSets: (cardSetsCache: CollectionCache<CardSet> | null) => void
}

// @ts-ignore
export const CardsCacheContext: Context<CardsCacheContextType> = createContext({
    cards: null,
    setCards: () => {},
    cardSets: null,
    setCardSets: () => {}
});
