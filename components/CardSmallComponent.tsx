import Card from '@/models/Card';
import { Key } from 'react';

export default function CardSmallComponent ({
    card,
    key = '',
    className = ''
}: { card: Card, key?: Key, className?: string }) {
    const cardColorScheme = 'card-' + card.tier;

    return (
        <div key={key}
             className={
                 'border-4 rounded-xl bg-background bg-center bg-cover shadow-card '
                 + `border-${cardColorScheme} `
                 + className
             }
             style={{
                 'backgroundImage': `url(/cards-thumbnails/${card.image}-thumbnail.webp)`,
                 'height': '8.25rem',
                 'width': '5.5rem'
             }}
        >
        </div>
    );
}
