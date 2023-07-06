import { faDiceD6, faImages, faMagnifyingGlassLocation, faTrophy, faUser } from '@fortawesome/free-solid-svg-icons';
import NavbarButton from '@/components/Navbar/NavbarButton';
import NavbarSuperButton from '@/components/Navbar/NavbarSuperButton';
import { Page } from '@/Enum/Page';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type NavbarConfig = {
    icon: IconProp,
    onClick: (() => void) | null,
    href: Page | string | null,
    disabledAll: boolean,
    disabledSides: boolean,
    animate: boolean,
    animatePointsAdded: number | null,
    onlyCenter: boolean
}

export default function Navbar ({ navbarConfig }: { navbarConfig: NavbarConfig }) {
    if (navbarConfig.onlyCenter) {
        return (
            <div
                className={'grid align-center justify-items-center text-3xl'
                    + ' bg-background-transparent bottom-0 fixed w-screen z-50'}
            >
                <NavbarSuperButton
                    href={navbarConfig.href}
                    icon={navbarConfig.icon}
                    onClick={navbarConfig.onClick}
                    disabled={navbarConfig.disabledAll}
                    animate={navbarConfig.animate}
                    onlyCenter={navbarConfig.onlyCenter}
                />
            </div>
        );
    }

    return (
        <div
            className={'grid align-center justify-items-center text-3xl'
                + ' bg-background-transparent fixed bottom-0 w-screen z-50'}
            style={{ gridTemplateColumns: 'repeat(2, 1fr) 100px repeat(2, 1fr)' }}
        >
            <NavbarButton
                href={Page.COLLECT} icon={faMagnifyingGlassLocation}
                disabled={navbarConfig.disabledAll || navbarConfig.disabledSides}
            />
            <NavbarButton
                href={Page.COLLECTION} icon={faImages}
                disabled={navbarConfig.disabledAll || navbarConfig.disabledSides}
            />
            <NavbarSuperButton
                href={navbarConfig.href}
                icon={navbarConfig.icon}
                onClick={navbarConfig.onClick}
                disabled={navbarConfig.disabledAll}
                animate={navbarConfig.animate}
            />
            <div className="relative">
                <NavbarButton
                    href={Page.RANKING}
                    icon={faTrophy}
                    disabled={navbarConfig.disabledAll || navbarConfig.disabledSides}
                    className={navbarConfig.animatePointsAdded ? 'animate-[pulse_1s_ease-in-out_4]' : ''}
                />
                {navbarConfig.animatePointsAdded &&
                    <div
                        className="absolute top-0 left-0 w-20 text-left animate-pointsAdded"
                        style={{
                            zIndex: -10,
                            left: '-0.4rem'
                        }}
                    >
                        <p className="p-2 font-fancy text-xl">
                            + <FontAwesomeIcon icon={faDiceD6} size="xs"/> {navbarConfig.animatePointsAdded}</p>
                    </div>
                }
            </div>
            <NavbarButton
                href={Page.ACCOUNT} icon={faUser}
                disabled={navbarConfig.disabledAll || navbarConfig.disabledSides}
            />
        </div>
    );
}
