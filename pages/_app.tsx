import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { UserContext } from '@/lib/context';
import { useUserData } from '@/lib/hooks';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar/Navbar';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Spectral, Trykker } from 'next/font/google';

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

    return (
        <UserContext.Provider value={userData}>
            <main
                className={
                    `${spectral.variable} ${trykker.variable} `
                    + `font-serif bg-image-default bg-center bg-cover bg-fixed min-h-screen`
                }
            >
                <Navbar/>
                <Component {...pageProps} />
                <Toaster/>
            </main>
        </UserContext.Provider>
    );
}
