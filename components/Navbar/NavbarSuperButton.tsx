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
        'p-4 text-4xl text-center border-4 rounded-full shadow-panel bg-button-gradient bottom-2 h-24 w-24'
        + ' absolute flex justify-center content-center items-center'
        + (!disabled
                ? ' cursor-auto text-button-base border-button-base'
                : ' cursor-not-allowed text-gray-600 border-gray-600'
        )
        + (animate ? ' animate-bounce' : '');

    const style = {
        background: (!disabled
            ? 'bg-button-gradient'
            : 'bg-button-gradient-disabled'),
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
