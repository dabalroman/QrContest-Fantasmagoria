import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';

export default function NavbarSuperButton ({
    href,
    icon
}: { href: string, icon: IconProp }) {
    return (
        <Link href={href} className="relative w-24">
            <div
                className="p-4 text-4xl text-center text-button-brown border-4 border-button-brown rounded-full
                shadow-panel bg-gradient-navbar-button bottom-2 h-24 w-24 absolute flex justify-center content-center
                items-center">
                <FontAwesomeIcon icon={icon}/>
            </div>
        </Link>
    );
}
