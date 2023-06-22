import { faImages, faMagnifyingGlassLocation, faTrophy, faUser } from '@fortawesome/free-solid-svg-icons';
import NavbarButton from '@/components/Navbar/NavbarButton';
import NavbarSuperButton from '@/components/Navbar/NavbarSuperButton';
import { Page } from '@/Enum/Page';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export type NavbarCenterAction = {
    icon: IconProp,
    onClick: (() => void) | null,
    href: Page | string | null,
    disabled: boolean,
    animate: boolean
}

export default function Navbar ({ navbarCenterAction }: { navbarCenterAction: NavbarCenterAction }) {
    return (
        <div
            className={'grid align-center justify-items-center text-3xl'
                + ' bg-background-transparent fixed bottom-0 w-screen z-50'}
            style={{ gridTemplateColumns: 'repeat(2, 1fr) 100px repeat(2, 1fr)' }}
        >
            <NavbarButton href={Page.COLLECT} icon={faMagnifyingGlassLocation}/>
            <NavbarButton href={Page.COLLECTION} icon={faImages}/>
            <NavbarSuperButton
                href={navbarCenterAction.href}
                icon={navbarCenterAction.icon}
                onClick={navbarCenterAction.onClick}
                disabled={navbarCenterAction.disabled}
                animate={navbarCenterAction.animate}
            />
            <NavbarButton href={Page.RANKING} icon={faTrophy}/>
            <NavbarButton href={Page.ACCOUNT} icon={faUser}/>
        </div>
    );
}
