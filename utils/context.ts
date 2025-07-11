import {Context, createContext} from 'react';
import User from '@/models/User';
import {User as FirebaseUser} from '@firebase/auth';
import CollectionCache from '@/models/CollectionCache';
import Card from '@/models/Card';
import CardSet from '@/models/CardSet';
import CardClue from '@/models/CardClue';
import {Page} from '@/Enum/Page';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {NavbarConfig} from '@/components/Navbar/Navbar';
import {AppTheme} from "@/Enum/AppTheme";

export type AuthUser = FirebaseUser;

// ---- USER ----
export interface UserContextType {
    authUser: AuthUser | null,
    authLoading: boolean,
    user: User | null,
    userLoading: boolean,
    userReady: boolean
}

// @ts-ignore
export const UserContext: Context<UserContextType> = createContext({
    authUser: null,
    authLoading: false,
    user: null,
    userLoading: false,
    userReady: false
});

// ---- CARDS ----
export interface CardsCacheContextType {
    cards: CollectionCache<Card> | null,
    setCards: (cardsCache: CollectionCache<Card> | null) => void,
    cardSets: CollectionCache<CardSet> | null,
    setCardSets: (cardSetsCache: CollectionCache<CardSet> | null) => void,
    clues: CollectionCache<CardClue> | null,
    setClues: (cluesCache: CollectionCache<CardClue> | null) => void,
}

// @ts-ignore
export const CardsCacheContext: Context<CardsCacheContextType> = createContext({
    cards: null,
    setCards: () => {
    },
    cardSets: null,
    setCardSets: () => {
    },
    clues: null,
    setClues: () => {
    }
});

// ---- NAVBAR ----
export const defaultNavbarConfig: NavbarConfig = {
    icon: faMagnifyingGlass,
    onClick: null,
    href: Page.COLLECT,
    disabled: false,
    disabledCenter: false,
    disabledSides: false,
    animate: false,
    animatePointsAdded: null,
    onlyCenter: false
};

export interface NavbarConfigContextType {
    navbarConfig: NavbarConfig,
    setNavbarCenterAction: (navbarCenterAction: NavbarConfig) => void
}

// @ts-ignore
export const NavbarConfigContext: Context<NavbarConfigContextType> = createContext({
    navbarConfig: defaultNavbarConfig,
    setNavbarCenterAction: () => {
    }
});

// ---- THEME ----
export type Theme = AppTheme | null;

export interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>({
    theme: null,
    setTheme: () => {
    }
});
