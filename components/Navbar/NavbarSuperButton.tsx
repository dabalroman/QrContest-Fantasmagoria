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
        'p-4 text-4xl text-center rounded-full shadow-panel bg-text-accent h-24 w-24'
        + ' absolute flex justify-center content-center items-center mb-3'
        + (!disabled
                ? ' cursor-auto text-text-light'
                : ' cursor-not-allowed text-gray-600'
        )
        + (animate ? ' animate-pulseSize' : '');

    const style = {
        background: (!disabled
            ? 'bg-button-accent'
            : 'bg-button-dim'),
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
