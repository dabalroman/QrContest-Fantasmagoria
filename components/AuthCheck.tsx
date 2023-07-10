import { useRouter } from 'next/router';
import { ReactNode, useContext, useEffect } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { Page } from '@/Enum/Page';
import Custom404 from '@/pages/404';
import Loader from '@/components/Loader';

export default function AuthCheck ({ children }: { children: ReactNode }) {
    const router = useRouter();
    const publicRoutes = [
        '',
        Page.MAIN,
        Page.LOGIN,
        Page.LOGIN_EMAIL,
        Page.COLLECT,
        Page.REGISTER,
        Page.REGISTER_EMAIL,
        Page.ACCOUNT_SETUP,
        Page.RULEBOOK,
        Page.FAQ
    ];

    const {
        authUser,
        authLoading,
        user
    } = useContext<UserContextType>(UserContext);

    // The page COLLECT should not display 404 when user is not logged in to allow new users to register into the app.
    useEffect(() => {
        if (!router.pathname.includes(Page.COLLECT) || authLoading) {
            return;
        }

        if (!authUser || !authUser.uid) {
            router.push(Page.MAIN);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading]);

    // Wait a moment for the device to load the auth state
    if (authLoading) {
        return <Loader/>;
    }

    // User can see the private pages only when auth state is loaded and user data is fetched from Firestore
    if (publicRoutes.includes(router.pathname) || (user && user.uid)) {
        return <>
            {children}
        </>;
    }

    return <Custom404/>;
}
