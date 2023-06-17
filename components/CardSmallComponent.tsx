import Card from '@/models/Card';
import { Key } from 'react';

export default function CardSmallComponent ({
    card,
    key,
    className = ''
}: { card: Card, key?: Key, className?: string }) {
    return (
        <div key={key}
             className={
                 'border-4 border-card-border rounded-xl bg-background relative bg-center bg-cover shadow-card'
                 + ' ' + className
             }
             style={{
                 'backgroundImage': `url(cards/${card.image}.png)`,
                 'height': '8.25rem',
                 'width': '5.5rem'
             }}
        >
        </div>
    );
}
