import { useContext, useEffect } from 'react';
import { Page } from '@/Enum/Page';
import { UserContext, UserContextType } from '@/utils/context';
import { UserRole } from '@/Enum/UserRole';
import { useRouter } from 'next/router';

export default function useAdminOnly () {
    const router = useRouter();
    const { user } = useContext<UserContextType>(UserContext);

    useEffect(() => {
        if (!user || user?.role !== UserRole.ADMIN) {
            router.push(Page.COLLECT)
                .then();
        }
    }, [router, user]);
}
