/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './layouts/**/*.{js,ts,jsx,tsx}'
        // "./sections/**/*.{js,ts,jsx,tsx}",
        // "./templates/**/*.{js,ts,jsx,tsx}",
        // "./utils/**/*.{js,ts,jsx,tsx}",
        // "./data/**/*.{js,ts,jsx,tsx}",
        // "./public/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                fancy: ['var(--font-imFellDoublePica)'],
                'fancy-capitals': ['var(--font-imFellDoublePicaSC)'],
                base: ['var(--font-montserrat)']
            },
            backgroundImage: {
                'image-default': 'url(\'/backgrounds/bg.webp\')',
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'button-gradient': 'linear-gradient(175deg, #254455 10%, #253C4B 50%, #2B4455 90%)',
                'button-gradient-disabled': 'linear-gradient(175deg, #171d21 10%, #1b2329 50%, #171d21 90%)'
            },
            borderWidth: {
                '6': '6px'
            },
            boxShadow: {
                'panel': '0 8px 5px rgba(0,0,0,0.25)',
                'card': '4px 4px 6px rgba(61,36,0,0.40)',
                'inner-input': 'inset 0 4px 4px rgba(0,0,0,0.15)'
            },
            gridTemplateRows: {
                'layout': 'max-content minmax(0,1fr) 100px'
            },
            gridTemplateColumns: {
                'small-cards': 'repeat(auto-fit, minmax(88px, 1fr));'
            },
            colors: {
                'panel-transparent': 'var(--color-panel-bg)',

                'overlay-start': 'rgba(217,217,217,1)',
                'overlay-via': 'rgba(217,217,217,0.8)',
                'overlay-end': 'rgba(217,217,217,0)',

                'text-light': 'var(--color-text-light)',
                'text-base': 'var(--color-text-dark)',
                'text-dim': 'var(--color-dim)',
                'text-accent': 'var(--color-primary)',

                'card-border': '#868686',

                'input-border': 'var(--color-primary)',
                'input-background': 'var(--color-button-bg)',

                // Whole app and images
                background: '#E4D5C6',
                'navbar-background': '#DEDEDE',
                'button-base': 'var(--color-button-bg)',
                'button-accent': 'var(--color-primary)',
                'button-dim': 'var(--color-dim)',
                'button-border': 'var(--color-primary)',

                'card-common': 'var(--color-common)',
                'card-rare': 'var(--color-rare)',
                'card-epic': 'var(--color-epic)',
                'card-legendary': 'var(--color-legendary)',
                'card-mythical': 'var(--color-mythical)',

                'guild-desert': 'var(--color-guild-desert)',
                'guild-void': 'var(--color-guild-void)',
                'guild-water': 'var(--color-guild-water)',
                'guild-steel': 'var(--color-guild-steel)'
            },
            keyframes: {
                pointsAdded: {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(0)'
                    },
                    '30%': {
                        opacity: 1,
                        transform: 'translateY(-2.5rem)'
                    },
                    '80%': {
                        opacity: 1,
                        transform: 'translateY(-2.5rem)'
                    },
                    '100%': {
                        opacity: 0,
                        transform: 'translateY(-2.5rem)'
                    }
                },
                flash: {
                    '0%': {
                        filter: 'brightness(1)'
                    },
                    '5%': {
                        filter: 'brightness(3)'
                    },
                    '100%': {
                        filter: 'brightness(1)'
                    }
                },
                pulseSize: {
                    '0%': {
                        transform: 'scale(1)',
                    },
                    '50%': {
                        transform: 'scale(1.05)',
                    },
                    '100%': {
                        transform: 'scale(1.0)'
                    }
                },
                cardReveal: {
                    '80%': {
                        transform: 'translateY(0%)',
                    },
                    '100%': {
                        transform: 'translateY(100%)',
                    }
                }
            },
            animation: {
                'pointsAdded': 'pointsAdded 4s ease-in-out 0s 1 normal forwards',
                'flash': 'flash 0.4s ease-out 0s 1 normal forwards',
                'pulseSize': 'pulseSize 1s ease-in-out 0s infinite normal forwards',
                'cardReveal': 'cardReveal 4s ease-in-out 0s 1 normal forwards',
            }
        }
    },
    safelist: [
        'border-guild-desert',
        'border-guild-void',
        'border-guild-water',
        'border-guild-steel',
        'bg-guild-desert',
        'bg-guild-void',
        'bg-guild-water',
        'bg-guild-steel',
        'text-guild-desert',
        'text-guild-void',
        'text-guild-water',
        'text-guild-steel',
        'border-card-common',
        'border-card-rare',
        'border-card-epic',
        'border-card-legendary',
        'border-card-mythical',
        'bg-card-common',
        'bg-card-rare',
        'bg-card-epic',
        'bg-card-legendary',
        'bg-card-mythical',
        'ring-card-common',
        'ring-card-rare',
        'ring-card-epic',
        'ring-card-legendary',
        'ring-card-mythical',
        'text-card-common',
        'text-card-rare',
        'text-card-epic',
        'text-card-legendary',
        'text-card-mythical',
    ],
    plugins: []
};

