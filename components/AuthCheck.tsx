import { useRouter } from 'next/router';
import { ReactNode, useContext } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { Page } from '@/Enum/Page';
import Custom404 from '@/pages/404';

export default function AuthCheck ({ children }: { children: ReactNode }) {
    const router = useRouter();
    const publicRoutes = [
        '',
        Page.MAIN,
        Page.LOGIN,
        Page.LOGIN_EMAIL,
        Page.REGISTER,
        Page.REGISTER_EMAIL,
        Page.ACCOUNT_SETUP
    ];
    const { user } = useContext<UserContextType>(UserContext);

    if (publicRoutes.includes(router.pathname) || (user && user.uid)) {
        return <>{children}</>;
    }

    return <Custom404/>;
}
