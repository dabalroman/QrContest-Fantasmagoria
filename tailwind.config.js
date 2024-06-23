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
                serif: ['var(--font-spectral)'],
                fancy: ['var(--font-imFellDoublePica)'],
                'fancy-capitals': ['var(--font-imFellDoublePicaSC)']
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
                'panel-transparent': 'rgba(39,50,58,0.95)',
                'panel-transparent-end': 'rgba(39,50,58,0.85)',
                'panel-solid': 'rgba(39,50,58,1)',

                'text-base': '#eee',
                'text-dim': '#bfbfbf',
                'text-accent': '#eee',

                'card-border': '#273F4F',

                'input-border': '#273F4F',
                'input-background': '#4C6962',

                // Whole app and images
                background: '#273F4F',
                'navbar-background': 'rgba(26,40,51,0.95)',
                'button-base': '#8da8b1',

                'guild-desert': '#be8d23',
                'guild-void': '#7036b6',
                'guild-water': '#3e75be',
                'guild-steel': '#4B4B4B'
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
                        filter: 'brightness(7)'
                    },
                    '100%': {
                        filter: 'brightness(1)'
                    }
                }
            },
            animation: {
                'pointsAdded': 'pointsAdded 4s ease-in-out 0s 1 normal forwards',
                'flash': 'flash 0.8s ease-out 0s 1 normal forwards'
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
        'text-guild-steel'
    ],
    plugins: []
};

