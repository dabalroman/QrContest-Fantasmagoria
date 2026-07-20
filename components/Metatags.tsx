import Head from 'next/head';

export default function Metatags({
    title = '',
    description = 'Gra Konwentowa to internetowa gra terenowa dla uczestników konwentu fantastyki Fantasmagoria ' +
        'w Gnieźnie. Odkrywaj piny na mapie konwentu, skanuj kody QR, rozwiązuj zagadki i zbieraj punkty, ' +
        'a następnie rywalizuj w rankingu o nagrody.',
    image = '',
}) {
    return (
        <Head>
            <title>
                {title ? `${title} - Gra Konwentowa - Fantasmagoria 16` : 'Gra Konwentowa - Fantasmagoria 16'}
            </title>

            <meta name="description" content={description}/>

            <meta name="google-site-verification" content="K49QwkS2Y54dgIa6Y_GL7KPvSwVdFPePUX3XQF-5AD4" />

            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content='Gra Konwentowa - Fantasmagoria 16' />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <meta property="og:title" content='Gra Konwentowa - Fantasmagoria 16' />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="color-scheme" content="light only"/>

            <link rel="shortcut icon" type="image/svg+xml" href="/ico/fantasmagoria_64px.svg"/>
            <link rel="icon" type="image/png" sizes="48x48" href="/ico/fantasmagoria_48px.png"/>
            <link rel="icon" type="image/png" sizes="96x96" href="/ico/fantasmagoria_96px.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/ico/fantasmagoria_32px.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/ico/fantasmagoria_16px.png"/>
            <link rel="icon" type="image/png" sizes="64x64" href="/ico/fantasmagoria_64px.png"/>
            <link rel="icon" type="image/png" sizes="128x128" href="/ico/fantasmagoria_128px.png"/>
            <link rel="icon" type="image/png" sizes="256x256" href="/ico/fantasmagoria_256px.png"/>
        </Head>
    );
}
