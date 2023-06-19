import { Key } from 'react';

export default function CardSmallHiddenComponent ({
    key,
    className = ''
}: { key?: Key, className?: string }) {
    return (
        <div key={key}
             className={
                 'border-4 border-gray-600 rounded-xl bg-background relative bg-center bg-cover shadow-card'
                 + ' ' + className
             }
             style={{
                 'backgroundImage': `url(/cards/hidden.jpg)`,
                 'height': '8.25rem',
                 'width': '5.5rem'
             }}
        >
        </div>
    );
}
