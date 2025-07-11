import Card from '@/models/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { getCardTierFriendlyName } from '@/Enum/CardTier';
import { useEffect, useRef, useState } from 'react';

export default function CardComponent ({
    card,
    className = ''
}: { card: Card, className?: string }) {
    const cardRef = useRef(null);
    const [initialOrientation, setInitialOrientation] = useState({
        beta: 0,
        gamma: 0
    });

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (!cardRef.current) {
                return;
            }

            if (initialOrientation.beta === 0 && initialOrientation.gamma === 0) {
                setInitialOrientation({
                    beta: event.beta ?? 0,
                    gamma: event.gamma ?? 0
                });
            }

            const xTilt = (event.gamma ?? 0) - initialOrientation.gamma; // range [-90,90]
            const yTilt = (event.beta ?? 0) - initialOrientation.beta; // range [-180,180]

            const maxTilt = 45;

            const xRotation = -((xTilt + 90) / 180 - 0.5) * maxTilt;
            const yRotation = ((yTilt + 180) / 360 - 0.5) * maxTilt;

            // @ts-ignore
            cardRef.current.style.transform =
                `perspective(600px) rotateX(${yRotation}deg) rotateY(${xRotation}deg) scale(0.9)`;
            // @ts-ignore
            cardRef.current.style.setProperty('--glare-left', `${xRotation / 10 * 50 - 50}%`);
        };

        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [initialOrientation, setInitialOrientation]);

    const cardColorScheme = 'card-' + card.tier;
    const trimmedDescription = card.description.length > 150
        ? (card.description.split(' ')
            .slice(0, 30)
            .join(' ') + '...')
        : card.description;

    return (
        <div
            ref={cardRef}
            className={
                'rounded-3xl relative '
                + 'border-8 duration-150 ease-in-out '
                + `border-${cardColorScheme} bg-${cardColorScheme}`
                + ' ' + className
            }
            style={{
                'minHeight': '200px',
                'maxHeight': '80vh',
                'aspectRatio': '6/10',
                'objectFit': 'contain',
                'overflow': 'hidden',
                'filter': 'drop-shadow(8px 8px 10px rgba(0,0,0,0.5))',
                // @ts-ignore
                '--glare-left': '-50%'
            }}
        >
            <div
                className={`bg-${cardColorScheme} flex items-center h-full w-full absolute z-20 `
                    + 'text-text-light animate-cardReveal'}
                style={{ pointerEvents: 'none' }}>
                <span
                    className="w-full whitespace-pre-line text-2xl font-semibold text-center p-6">{trimmedDescription}</span>
            </div>
            <div className="flex h-full w-full flex-col absolute z-0">
                <div className="bg-center bg-cover grow w-full" style={{
                    'backgroundImage': `url(/cards/${card.image}.webp)`
                }}></div>
                <div
                    className={
                        `bg-${cardColorScheme} `
                        + 'text-text-light pb-4 pl-4 pt-3 pr-4 w-full text-center'
                    }>
                    <span className="text-2xl font-semibold">{card.name}</span>
                </div>
            </div>
            <div
                className={
                    `bg-${cardColorScheme} `
                    + 'text-center text-text-light absolute top-0 right-0 pb-4 pl-5 pt-2 pr-4 rounded-bl-3xl z-10'
                }
            >
                <span className="text-3xl block font-bold">
                    <FontAwesomeIcon icon={faStar} size="xs"/> {card.value}
                </span>
                <span className="mt-1 block text-xl font-semibold">{getCardTierFriendlyName(card.tier)}</span>
            </div>
            <div
                className="glare z-30"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: 'var(--glare-left)',
                    width: '700px',
                    height: '100%',
                    background: 'linear-gradient(70deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.25) 45%, '
                        + 'rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.25) 55%, rgba(255,255,255,0) 70%)',
                    pointerEvents: 'none'
                }}
            ></div>
        </div>
    );
}
