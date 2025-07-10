import { CardTier } from '@/Enum/CardTier';

export default function CardSmallHiddenComponent ({
    className = '',
    cardTier = CardTier.COMMON,
    key = null
}: { className?: string, cardTier: CardTier, key?: string | null }) {
    const cardColorScheme = 'card-' + cardTier;

    return (
        <div
            key={key}
            className={
                'border-4 rounded-xl bg-background relative bg-center bg-cover shadow-card opacity-70'
                + ` border-${cardColorScheme} `
                + ' ' + className
            }
            style={{
                'backgroundImage': `url(/cards-reverse/card-bg-${cardTier}-thumbnail.webp)`,
                'height': '8.25rem',
                'width': '5.5rem'
            }}
        >
        </div>
    );
}
