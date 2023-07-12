import Card from '@/models/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import { getCardTierFriendlyName } from '@/Enum/CardTier';

export default function CardComponent ({
    card,
    className = ''
}: { card: Card, className?: string }) {
    return (
        <div
            className={
                'border-8 border-card-border rounded-3xl bg-background relative bg-center bg-cover'
                + ' ' + className
            }
            style={{
                'backgroundImage': `url(/cards/${card.image}.webp)`,
                'minHeight': '200px'
            }}
        >
            <div
                className="bg-card-border text-center text-text-light absolute top-0 right-0 pb-2 pl-4 pt-0 pr-2
                rounded-bl-3xl"
            >
                <span className="text-2xl font-fancy block">
                    <FontAwesomeIcon icon={faDiceD6} size="xs" className="relative top-1"/> {card.value}
                </span>
                <span className="mt-1 block">{getCardTierFriendlyName(card.tier)}</span>
            </div>
            <div
                className="bg-card-border text-text-light absolute bottom-0 left-0 pb-2 pl-2 pt-3 pr-4 rounded-tr-3xl">
                <span className="text-2xl font-fancy">{card.name}</span>
            </div>
        </div>
    );
}
