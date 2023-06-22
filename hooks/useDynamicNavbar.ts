import { useContext, useEffect } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Page } from '@/Enum/Page';
import { defaultNavbarCenterAction, NavbarCenterActionContext, NavbarCenterActionContextType } from '@/utils/context';

export default function useDynamicNavbar ({
    href,
    icon,
    onClick,
    disabled,
    animate
}: { href?: Page | string, icon?: IconProp, onClick?: () => void, disabled?: boolean, animate?: boolean }) {
    const { setNavbarCenterAction } = useContext<NavbarCenterActionContextType>(NavbarCenterActionContext);

    useEffect(() => {
        setNavbarCenterAction({
            href: href ?? Page.COLLECT,
            icon: icon ?? faMagnifyingGlass,
            onClick: onClick ?? null,
            disabled: disabled ?? false,
            animate: animate ?? false
        });

        return () => setNavbarCenterAction(defaultNavbarCenterAction);

        // onClick in deps will cause infinite loop
    }, [href, icon, disabled, animate]);
}
