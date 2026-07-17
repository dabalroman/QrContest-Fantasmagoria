import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PinType } from '@/Enum/PinType';
import getPinIcon from '@/utils/getPinIcon';

// Rendered to static HTML (react-dom/server) and handed to L.divIcon. Lives under components/ so
// Tailwind's content glob sees the classes; the bg-/border-pin-* set is already safelisted (decision 19).
export default function PinMarkerIcon ({
    type,
    collected = false
}: { type: PinType, collected?: boolean }) {
    const scheme = 'pin-' + type;

    return (
        <div
            className={
                'w-10 h-10 rounded-full border-2 border-white shadow-card '
                + 'flex items-center justify-center text-text-light '
                + `bg-${scheme} `
                + (collected ? 'opacity-50 grayscale' : '')
            }
        >
            <FontAwesomeIcon icon={getPinIcon(type)} className="w-1/2 h-1/2"/>
        </div>
    );
}
