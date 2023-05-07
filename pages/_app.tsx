import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { UserContext } from '@/lib/context';
import { useUserData } from '@/lib/hooks';

export default function App ({
    Component,
    pageProps
}: AppProps) {
    const userData = useUserData();

    return (
        <UserContext.Provider value={userData}>
            <Component {...pageProps} />
        </UserContext.Provider>
    );
}
