import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import {
    CardsCacheContext,
    defaultNavbarConfig,
    NavbarConfigContext,
    Theme,
    ThemeContext,
    UserContext
} from '@/utils/context';
import { Toaster } from 'react-hot-toast';
import Navbar, { NavbarConfig } from '@/components/Navbar/Navbar';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { IM_Fell_Double_Pica, IM_Fell_Double_Pica_SC, Montserrat } from 'next/font/google';
import AuthCheck from '@/components/AuthCheck';
import { useEffect, useState } from 'react';
import CollectionCache from '@/models/CollectionCache';
import Card from '@/models/Card';
import CardSet from '@/models/CardSet';
import CardClue from '@/models/CardClue';
import Metatags from '@/components/Metatags';
import useUserData from '@/hooks/useUserData';
import { UserRole } from '@/Enum/UserRole';
import { useRouter } from 'next/router';
import { Page } from '@/Enum/Page';
import { getThemeFromGuildUuid } from '@/Enum/AppTheme';

config.autoAddCss = false;

const imFellDoublePica = IM_Fell_Double_Pica({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-imFellDoublePica'
});
const imFellDoublePicaSC = IM_Fell_Double_Pica_SC({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-imFellDoublePicaSC'
});
const montserrat = Montserrat({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-montserrat'
});

export default function App ({
    Component,
    pageProps
}: AppProps) {
    const userData = useUserData();
    const router = useRouter();
    const [theme, setTheme] = useState<Theme>(null);
    const [cards, setCards] = useState<CollectionCache<Card> | null>(null);
    const [cardSets, setCardSets] = useState<CollectionCache<CardSet> | null>(null);
    const [clues, setClues] = useState<CollectionCache<CardClue> | null>(null);
    const [navbarCenterAction, setNavbarCenterAction] = useState<NavbarConfig>(defaultNavbarConfig);

    useEffect(() => {
        if (userData.authUser === null) {
            setCards(null);
        }
    }, [userData.authUser]);

    useEffect(() => {
        if (userData.user?.role === UserRole.DASHBOARD && router.pathname !== Page.DASHBOARD) {
            router.push(Page.DASHBOARD)
                .then();
        }
    }, [router, userData.user]);

    useEffect(() => {
        setTheme(getThemeFromGuildUuid(userData.user?.memberOf ?? null));
    }, [userData.authUser, userData.user]);

    return (
        <UserContext.Provider value={userData}>
            <ThemeContext.Provider value={{
                theme,
                setTheme
            }}>
                <NavbarConfigContext.Provider value={{
                    navbarConfig: navbarCenterAction,
                    setNavbarCenterAction
                }}>
                    <CardsCacheContext.Provider value={{
                        cards,
                        setCards,
                        cardSets,
                        setCardSets,
                        clues,
                        setClues
                    }}>
                        <>
                            <Metatags title="QrContest"/>
                            <div
                                className={
                                    `${imFellDoublePica.variable} ${imFellDoublePicaSC.variable} `
                                    + `${montserrat.variable} text-text-base `
                                    + `font-base bg-image-default bg-fixed min-h-screen bg-image-mobile-position `
                                    + theme
                                }
                            >
                                <Navbar navbarConfig={navbarCenterAction}/>
                                <AuthCheck>
                                    <Component
                                        {...pageProps}
                                        className={
                                            `font-base bg-image-default bg-center bg-cover bg-fixed min-h-screen`
                                        }/>
                                    <Toaster toastOptions={{ duration: 6000 }}/>
                                </AuthCheck>
                            </div>
                        </>
                    </CardsCacheContext.Provider>
                </NavbarConfigContext.Provider>
            </ThemeContext.Provider>
        </UserContext.Provider>
    );
}
