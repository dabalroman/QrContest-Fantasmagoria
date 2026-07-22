import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PinType } from '@/Enum/PinType';
import getPinIcon from '@/utils/getPinIcon';

// Rendered to static HTML (react-dom/server) and handed to L.divIcon. Lives under components/ so
// Tailwind's content glob sees the classes; the bg-/border-pin-* set is already safelisted (decision 19).
export default function PinMarkerIcon ({
    type,
    collected = false,
    inline = false
}: { type: PinType, collected?: boolean, inline?: boolean }) {
    const scheme = 'pin-' + type;
    // A span so the inline variant is legal inside a <p>; display is set explicitly either way.
    const Tag = inline ? 'span' : 'div';

    return (
        <Tag
            className={
                'rounded-full border-2 border-white items-center justify-center text-text-light '
                + (inline
                    ? 'inline-flex w-6 h-6 text-xs align-text-bottom '
                    : 'flex w-10 h-10 text-lg shadow-card ')
                + `bg-${scheme} `
                + (collected ? 'opacity-50 grayscale' : '')
            }
        >
            <FontAwesomeIcon icon={getPinIcon(type)}/>
        </Tag>
    );
}
