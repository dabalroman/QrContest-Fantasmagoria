import { useContext, useEffect } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Page } from '@/Enum/Page';
import { defaultNavbarConfig, NavbarConfigContext, NavbarConfigContextType } from '@/utils/context';

export default function useDynamicNavbar ({
    href,
    icon,
    onClick,
    disabledAll,
    disabledSides,
    animate,
    onlyCenter,
    animatePointsAdded
}: {
    href?: Page | string,
    icon?: IconProp,
    onClick?: () => void,
    disabledAll?: boolean,
    disabledSides?: boolean,
    animate?: boolean,
    onlyCenter?: boolean,
    animatePointsAdded?: number
}) {
    const { setNavbarCenterAction } = useContext<NavbarConfigContextType>(NavbarConfigContext);

    useEffect(() => {
        setNavbarCenterAction({
            href: href ?? Page.COLLECT,
            icon: icon ?? faMagnifyingGlass,
            onClick: onClick ?? null,
            disabledAll: disabledAll ?? false,
            disabledSides: disabledSides ?? false,
            animate: animate ?? false,
            onlyCenter: onlyCenter ?? false,
            animatePointsAdded: animatePointsAdded ?? null
        });

        return () => setNavbarCenterAction(defaultNavbarConfig);

        // onClick in deps will cause infinite loop
    }, [href, icon, disabledAll, animate, onlyCenter]);
}
