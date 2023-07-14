import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { CardsCacheContext, defaultNavbarConfig, NavbarConfigContext, UserContext } from '@/utils/context';
import { Toaster } from 'react-hot-toast';
import Navbar, { NavbarConfig } from '@/components/Navbar/Navbar';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Spectral, Trykker } from 'next/font/google';
import AuthCheck from '@/components/AuthCheck';
import { useEffect, useState } from 'react';
import CollectionCache from '@/models/CollectionCache';
import Card from '@/models/Card';
import CardSet from '@/models/CardSet';
import Metatags from '@/components/Metatags';
import useUserData from '@/hooks/useUserData';
import { UserRole } from '@/Enum/UserRole';
import { useRouter } from 'next/router';
import { Page } from '@/Enum/Page';

config.autoAddCss = false;

const trykker = Trykker({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-trykker'
});
const spectral = Spectral({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-spectral'
});

export default function App ({
    Component,
    pageProps
}: AppProps) {
    const userData = useUserData();
    const router = useRouter();
    const [cards, setCards] = useState<CollectionCache<Card> | null>(null);
    const [cardSets, setCardSets] = useState<CollectionCache<CardSet> | null>(null);
    const [navbarCenterAction, setNavbarCenterAction] = useState<NavbarConfig>(defaultNavbarConfig);

    useEffect(() => {
        if (userData.authUser === null) {
            setCards(null);
        }
    }, [userData.authUser]);

    useEffect(() => {
        if(userData.user?.role === UserRole.DASHBOARD && router.pathname !== Page.DASHBOARD) {
            router.push(Page.DASHBOARD).then();
        }
    }, [router, userData.user]);

    return (
        <UserContext.Provider value={userData}>
            <NavbarConfigContext.Provider value={{
                navbarConfig: navbarCenterAction,
                setNavbarCenterAction
            }}>
                <CardsCacheContext.Provider value={{
                    cards,
                    setCards,
                    cardSets,
                    setCardSets
                }}>
                    <>
                        <Metatags title="QrContest"/>
                        <div
                            className={
                                `${spectral.variable} ${trykker.variable} `
                                + `font-serif bg-image-default bg-fixed min-h-screen bg-image-mobile-position`
                            }
                        >
                            <Navbar navbarConfig={navbarCenterAction}/>
                            <AuthCheck>
                                <Component
                                    {...pageProps}
                                    className={
                                        `${spectral.variable} ${trykker.variable} `
                                        + `font-serif bg-image-default bg-center bg-cover bg-fixed min-h-screen`
                                    }/>
                                <Toaster/>
                            </AuthCheck>
                        </div>
                    </>
                </CardsCacheContext.Provider>
            </NavbarConfigContext.Provider>
        </UserContext.Provider>
    );
}
