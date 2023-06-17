import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { CardsCacheContext, UserContext } from '@/utils/context';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar/Navbar';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Spectral, Trykker } from 'next/font/google';
import Head from 'next/head';
import useUserData from '@/hooks/useUserData';
import AuthCheck from '@/components/AuthCheck';
import { useState } from 'react';
import CollectionCache from '@/models/CollectionCache';
import Card from '@/models/Card';
import CardSet from '@/models/CardSet';

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

    return (
        <UserContext.Provider value={userData}>
            <CardsCacheContext.Provider value={{
                cards,
                setCards,
                cardSets,
                setCardSets
            }}>
                <>
                    <Head>
                        <meta name="viewport" content="width=device-width, initial-scale=1"/>
                        <meta name="color-scheme" content="light only"/>
                        <link rel="icon" href="/favicon.ico"/>
                    </Head>
                    <div
                        className={
                            `${spectral.variable} ${trykker.variable} `
                            + `font-serif bg-image-default bg-fixed min-h-screen bg-image-mobile-position`
                        }
                    >
                        <Navbar/>
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
        </UserContext.Provider>
    );
}
