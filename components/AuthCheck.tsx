import { useRouter } from 'next/router';
import { ReactNode, useContext, useEffect } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { Page } from '@/Enum/Page';
import Custom404 from '@/pages/404';
import Loader from '@/components/Loader';
import { savePendingCode } from '@/utils/pendingCode';

const publicRoutes: string[] = [
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

const knownRoutes: string[] = Object.values(Page);

export default function AuthCheck ({ children }: { children: ReactNode }) {
    const router = useRouter();

    const {
        authUser,
        authLoading,
        user,
        userLoading
    } = useContext<UserContextType>(UserContext);

    const isPublic = publicRoutes.includes(router.pathname);
    const isKnownRoute = knownRoutes.includes(router.pathname);
    const hasAccount = !!user?.uid;

    // A visitor without a user doc never sits on a known route: /collect stashes its code and funnels
    // into registration, every other known route goes to the landing page where the login buttons are.
    // hasAccount is a dependency because losing the account - signing out, an expired session - is
    // itself the trigger; nothing else in the list changes at that moment. router.isReady gates the
    // /collect branch because the code arrives from a next.config.js rewrite only after hydration.
    useEffect(() => {
        if (authLoading || userLoading || !router.isReady || hasAccount) {
            return;
        }

        if (router.pathname === Page.COLLECT) {
            if (typeof router.query.code === 'string') {
                savePendingCode(router.query.code);
            }

            router.replace(authUser?.uid ? Page.ACCOUNT_SETUP : Page.MAIN)
                .then();
            return;
        }

        if (!isPublic && isKnownRoute) {
            router.replace(Page.MAIN)
                .then();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, userLoading, hasAccount, router.isReady, router.pathname, router.query.code]);

    if (authLoading || userLoading) {
        return <Loader/>;
    }

    // Never render children before the user doc resolves: useAdminOnly bounces to /collect on !user,
    // so an optimistic render would throw legitimate admins off every admin page.
    if (hasAccount) {
        return <>
            {children}
        </>;
    }

    // Redirect in flight - a Loader, not the page we are leaving and not a dead end.
    if (router.pathname === Page.COLLECT || (!isPublic && isKnownRoute)) {
        return <Loader/>;
    }

    if (isPublic) {
        return <>
            {children}
        </>;
    }

    return <Custom404/>;
}
