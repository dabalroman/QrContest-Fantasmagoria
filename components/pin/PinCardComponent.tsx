import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { getPinTypeFriendlyName } from '@/Enum/PinType';
import { PinCardData } from '@/models/Pin';
import getPinIcon from '@/utils/getPinIcon';

export default function PinCardComponent ({
    pin,
    className = ''
}: { pin: PinCardData, className?: string }) {
    const pinColorScheme = 'pin-' + pin.type;

    return (
        <div
            className={
                'rounded-3xl relative '
                + 'border-8 duration-150 ease-in-out '
                + `border-${pinColorScheme} bg-${pinColorScheme}`
                + ' ' + className
            }
            style={{
                'minHeight': '200px',
                'maxHeight': '80vh',
                'aspectRatio': '6/10',
                'objectFit': 'contain',
                'overflow': 'hidden',
                'filter': 'drop-shadow(8px 8px 10px rgba(0,0,0,0.5))'
            }}
        >
            <div className="flex h-full w-full flex-col absolute z-0">
                <div className="grow w-full flex items-center justify-center text-text-light">
                    <FontAwesomeIcon icon={getPinIcon(pin.type)} className="w-1/2 h-1/2 opacity-90"/>
                </div>
                <div
                    className={
                        `bg-${pinColorScheme} `
                        + 'text-text-light pb-4 pl-4 pt-3 pr-4 w-full text-center'
                    }>
                    <span className="text-2xl font-semibold">{pin.name}</span>
                </div>
            </div>
            <div
                className={
                    `bg-${pinColorScheme} `
                    + 'text-center text-text-light absolute top-0 right-0 pb-4 pl-5 pt-2 pr-4 rounded-bl-3xl z-10'
                }
            >
                <span className="text-3xl block font-bold">
                    <FontAwesomeIcon icon={faStar} size="xs"/> {pin.value}
                </span>
                <span className="mt-1 block text-xl font-semibold">{getPinTypeFriendlyName(pin.type)}</span>
            </div>
        </div>
    );
}
