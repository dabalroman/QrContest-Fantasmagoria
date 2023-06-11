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
                className={
                    'p-4 text-4xl text-center text-button-brown border-4 border-button-brown rounded-full'
                    + ' shadow-panel bg-gradient-button bottom-2 h-24 w-24 absolute flex justify-center'
                    + ' content-center items-center'
                }
                style={{ 'background': 'linear-gradient(135deg, #C59251 25%, #FCCE8A 50%, #C59251 75%)' }}
            >
                <FontAwesomeIcon icon={icon}/>
            </div>
        </Link>
    );
}
