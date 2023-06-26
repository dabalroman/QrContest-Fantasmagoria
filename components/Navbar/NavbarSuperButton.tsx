import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import { Page } from '@/Enum/Page';

export default function NavbarSuperButton ({
    href,
    icon,
    onClick = null,
    disabled = false,
    animate = false,
    onlyCenter = false
}: {
    href: Page | string | null,
    icon: IconProp,
    onClick?: (() => void) | null,
    disabled?: boolean,
    animate?: boolean,
    onlyCenter?: boolean
}) {
    const className =
        'p-4 text-4xl text-center border-4 rounded-full shadow-panel bg-gradient-button bottom-2 h-24 w-24'
        + ' absolute flex justify-center content-center items-center'
        + (!disabled
                ? ' cursor-auto text-button-brown border-button-brown'
                : ' cursor-not-allowed text-gray-600 border-gray-600'
        )
        + (animate ? ' animate-bounce' : '');

    const style = {
        background: (!disabled
            ? 'linear-gradient(135deg, #C59251 25%, #FCCE8A 50%, #C59251 75%)'
            : 'linear-gradient(135deg, #8C8C8C 25%, #C2C2C2 50%, #8C8C8C 75%)'),
        bottom: (onlyCenter ? '-3rem' : '0'),
    };

    const iconElement = onlyCenter
        ? <FontAwesomeIcon className='relative bottom-5' icon={icon} size={'sm'}/>
        : <FontAwesomeIcon icon={icon}/>;

    return (
        <div onClick={(onClick && !disabled) ? onClick : undefined} className="relative w-24">
            {disabled && (
                <div className={className} style={style}>
                    {iconElement}
                </div>
            )}
            {!disabled && onClick && (
                <div className={className} style={style}>
                    {iconElement}
                </div>
            )}
            {!disabled && !onClick && (
                <Link href={href ? (href as string) : '#'}>
                    <div className={className} style={style}>
                        {iconElement}
                    </div>
                </Link>
            )}
        </div>
    );
}
