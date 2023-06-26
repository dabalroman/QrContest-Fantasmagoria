import { Context, createContext } from 'react';
import User from '@/models/User';
import { User as FirebaseUser } from '@firebase/auth';
import CollectionCache from '@/models/CollectionCache';
import Card from '@/models/Card';
import CardSet from '@/models/CardSet';
import { Page } from '@/Enum/Page';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { NavbarCenterAction } from '@/components/Navbar/Navbar';

export type AuthUser = FirebaseUser;

// ---- USER ----
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

// ---- CARDS ----
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

// ---- NAVBAR ----
export const defaultNavbarCenterAction: NavbarCenterAction = {
    icon: faMagnifyingGlass,
    onClick: null,
    href: Page.COLLECT,
    disabled: false,
    animate: false,
    onlyCenter: false
};

export interface NavbarCenterActionContextType {
    navbarCenterAction: NavbarCenterAction,
    setNavbarCenterAction: (navbarCenterAction: NavbarCenterAction) => void
}

// @ts-ignore
export const NavbarCenterActionContext: Context<NavbarCenterActionContextType> = createContext({
    navbarCenterAction: defaultNavbarCenterAction,
    setNavbarCenterAction: () => {}
});
