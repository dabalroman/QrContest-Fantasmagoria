import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { CardsCacheContext, defaultNavbarCenterAction, NavbarCenterActionContext, UserContext } from '@/utils/context';
import { Toaster } from 'react-hot-toast';
import Navbar, { NavbarCenterAction } from '@/components/Navbar/Navbar';
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
    const [cards, setCards] = useState<CollectionCache<Card> | null>(null);
    const [cardSets, setCardSets] = useState<CollectionCache<CardSet> | null>(null);
    const [navbarCenterAction, setNavbarCenterAction] = useState<NavbarCenterAction>(defaultNavbarCenterAction);

    useEffect(() => {
        if (userData.authUser === null) {
            setCards(null);
        }
    }, [userData.authUser]);

    return (
        <UserContext.Provider value={userData}>
            <NavbarCenterActionContext.Provider value={{
                navbarCenterAction,
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
                            <Navbar navbarCenterAction={navbarCenterAction}/>
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
            </NavbarCenterActionContext.Provider>
        </UserContext.Provider>
    );
}
