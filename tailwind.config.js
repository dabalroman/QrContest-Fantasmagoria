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
                fancy: ['var(--font-trykker)']
            },
            backgroundImage: {
                'image-default': 'url(\'/backgrounds/bg.jpg\')',
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            boxShadow: {
                'panel': '0 8px 5px rgba(0,0,0,0.25)',
                'inner-input': 'inset 0 4px 4px rgba(0,0,0,0.15)'
            },
            gridTemplateRows: {
                'layout': 'max-content minmax(0,1fr) 100px'
            },
            colors: {
                'panel-transparent': 'rgba(255,211,146,0.95)',
                'panel-transparent-end': 'rgba(255,211,146,0.85)',
                'panel-solid': 'rgba(255,211,146,1)',

                'text-dark': '#261500',
                'text-light': '#F2EFEA',

                'card-border': '#261500',

                'input-border': '#261500',
                'input-background': '#97784B',

                background: '#C59251',
                'background-transparent': 'rgba(197,146,81,0.9)',
                'button-brown': '#4d2b00'
            }
        }
    },
    plugins: []
};

