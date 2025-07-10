import Card from '@/models/Card';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons';
import {getCardTierFriendlyName} from '@/Enum/CardTier';
import {useEffect, useRef, useState} from 'react';
import useTheme from "@/hooks/useTheme";
import {getThemeFromCardTier} from "@/Enum/AppTheme";

export default function CardComponent({
    card,
    className = ''
}: { card: Card, className?: string }) {
    const cardRef = useRef(null);
    const [initialOrientation, setInitialOrientation] = useState({
        beta: 0,
        gamma: 0
    });

    const {setTheme} = useTheme();

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
    
    useEffect(() => {
        setTheme(getThemeFromCardTier(card.tier));
    }, [setTheme, card.tier]);

    return (
        <div
            ref={cardRef}
            className={
                'rounded-3xl relative bg-center bg-cover '
                + 'ring-8 ring-inset duration-150 ease-in-out '
                + `ring-${cardColorScheme} bg-${cardColorScheme}`
                + ' ' + className
            }
            style={{
                'backgroundImage': `url(/cards/${card.image}.webp)`,
                'minHeight': '200px',
                'maxHeight': '80vh',
                'aspectRatio': '2/3',
                'objectFit': 'contain',
                'overflow': 'hidden',
                'filter': 'drop-shadow(8px 8px 10px rgba(0,0,0,0.5))',
                // @ts-ignore
                '--glare-left': '-50%'
            }}
        >
            <div
                className={
                    `bg-${cardColorScheme} `
                    + "text-center text-text-light absolute top-0 right-0 pb-4 pl-5 pt-2 pr-4 rounded-bl-3xl"
                }
            >
                <span className="text-4xl block font-bold">
                    <FontAwesomeIcon icon={faStar} size="sm"/> {card.value}
                </span>
                <span className="mt-1 block text-xl font-semibold">{getCardTierFriendlyName(card.tier)}</span>
            </div>
            <div
                className={
                    `bg-${cardColorScheme} `
                    + "text-text-light absolute bottom-0 left-0 pb-4 pl-4 pt-3 pr-4 w-full text-center"
                }>
                <span className="text-4xl font-bold">{card.name}</span>
            </div>
            <div
                className="glare"
                style={{
                    'position': 'absolute',
                    'top': '0',
                    'left': 'var(--glare-left)',
                    'width': '700px',
                    'height': '100%',
                    'background': 'linear-gradient(70deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.25) 45%, '
                        + 'rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.25) 55%, rgba(255,255,255,0) 70%)',
                    'pointerEvents': 'none',
                    'zIndex': '10'
                }}
            ></div>
        </div>
    );
}
