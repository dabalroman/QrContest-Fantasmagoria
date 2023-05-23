import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { UserContext } from '@/lib/context';
import { useUserData } from '@/lib/hooks';
import { Toaster } from 'react-hot-toast';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export default function App ({
    Component,
    pageProps
}: AppProps) {
    const userData = useUserData();

    return (
        <UserContext.Provider value={userData}>
            <Component {...pageProps} />
            <Toaster/>
        </UserContext.Provider>
    );
}
