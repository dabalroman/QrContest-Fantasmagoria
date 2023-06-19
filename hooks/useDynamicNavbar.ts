import { useContext, useEffect } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Page } from '@/Enum/Page';
import { defaultNavbarCenterAction, NavbarCenterActionContext, NavbarCenterActionContextType } from '@/utils/context';

export default function useDynamicNavbar ({
    href,
    icon,
    onClick
}: { href?: Page, icon?: IconProp, onClick?: () => void }) {
    const { setNavbarCenterAction } = useContext<NavbarCenterActionContextType>(NavbarCenterActionContext);

    useEffect(() => {
        setNavbarCenterAction({
            href: href ?? Page.COLLECT,
            icon: icon ?? faMagnifyingGlass,
            onClick: onClick ?? null
        });

        return () => setNavbarCenterAction(defaultNavbarCenterAction);

        // onClick in deps will cause infinite loop
    }, [href, icon]);
}
