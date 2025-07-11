import { CardTier } from '@/Enum/CardTier';

export default function CardSmallHiddenComponent ({
    className = '',
    cardTier = CardTier.COMMON,
    withClue = false,
    key = null
}: { className?: string, cardTier: CardTier, withClue?: boolean, key?: string | number | null }) {
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
            {withClue &&
              <div className="flex flex-col justify-between h-full">
                <span className={`text-text-light font-bold text-3xl rounded-full pl-1`}>?</span>
                <span className={`text-text-light font-bold text-3xl rounded-full pr-1 text-right`}>?</span>
              </div>
            }
        </div>
    );
}
