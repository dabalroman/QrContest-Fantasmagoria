import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';

export default function NavbarButton ({ href, icon }: { href: string, icon: IconProp }) {
    return (
        <Link href={href}>
            <div className="p-4 text-button-brown"><FontAwesomeIcon icon={icon}/></div>
        </Link>
    );
}
