import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

// Empty stars are the solid faStar at low opacity - the repo has no free-regular-svg-icons dependency.
export default function StarRating ({
    value,
    onChange,
    disabled = false
}: {
    value: number,
    onChange: (value: number) => void,
    disabled?: boolean
}) {
    return (
        <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(star)}
                    aria-label={`Oceń na ${star} z 5`}
                    className="text-3xl"
                >
                    <FontAwesomeIcon
                        icon={faStar}
                        className={star <= value ? 'text-text-accent' : 'text-text-accent/20'}
                    />
                </button>
            ))}
        </div>
    );
}
