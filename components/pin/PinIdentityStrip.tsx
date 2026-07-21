import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { getPinTypeFriendlyName } from '@/Enum/PinType';
import { PinCardData } from '@/models/Pin';
import getPinIcon from '@/utils/getPinIcon';

export default function PinIdentityStrip ({
    pin,
    className = ''
}: { pin: PinCardData, className?: string }) {
    return (
        <div
            className={
                'flex items-center gap-3 rounded-xl p-3 shadow-panel '
                + `bg-pin-${pin.type} text-text-light`
                + ' ' + className
            }
        >
            <FontAwesomeIcon icon={getPinIcon(pin.type)} className="text-3xl shrink-0"/>
            <div className="min-w-0 flex-1">
                <p className="text-xl font-semibold leading-tight line-clamp-2">{pin.name}</p>
                <p className="text-sm opacity-80 leading-tight">{getPinTypeFriendlyName(pin.type)}</p>
            </div>
            <span className="shrink-0 text-xl font-bold whitespace-nowrap">
                <FontAwesomeIcon icon={faStar} size="xs"/> {pin.value}
            </span>
        </div>
    );
}
