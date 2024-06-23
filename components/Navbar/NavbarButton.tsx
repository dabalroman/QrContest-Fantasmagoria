import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';

export default function NavbarButton ({
    href,
    icon,
    disabled = false,
    className = ''
}: { href: string, icon: IconProp, disabled?: boolean, className?: string }) {
    if (disabled) {
        return <div className={'p-4 cursor-not-allowed text-gray-500 ' + className}>
            <FontAwesomeIcon icon={icon}/>
        </div>;
    }

    return (
        <Link href={href}>
            <div className={'p-4 text-button-base' + className}><FontAwesomeIcon icon={icon}/></div>
        </Link>
    );
}
