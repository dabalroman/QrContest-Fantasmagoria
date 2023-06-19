import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import { Page } from '@/Enum/Page';

export default function NavbarSuperButton ({
    href,
    icon,
    onClick = null
}: { href: Page | null, icon: IconProp, onClick?: (() => void) | null }) {
    const className =
        'p-4 text-4xl text-center text-button-brown border-4 border-button-brown rounded-full'
        + ' shadow-panel bg-gradient-button bottom-2 h-24 w-24 absolute flex justify-center'
        + ' content-center items-center';

    const style = { 'background': 'linear-gradient(135deg, #C59251 25%, #FCCE8A 50%, #C59251 75%)' };

    return (
        <div onClick={(onClick) ? onClick : undefined} className="relative w-24">
            {onClick && (
                <div className={className} style={style}>
                    <FontAwesomeIcon icon={icon}/>
                </div>
            )}
            {!onClick && (
                <Link href={href ? (href as string) : '#'}>
                    <div className={className} style={style}>
                        <FontAwesomeIcon icon={icon}/>
                    </div>
                </Link>
            )}
        </div>
    );
}
