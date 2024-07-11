import Head from 'next/head';

export default function Metatags({
    title = '',
    description = 'QrContest - Fantasmagoria 14',
    image = '',
}) {
    return (
        <Head>
            <title>{title ? `${title} - QrContest - Fantasmagoria 14` : 'QrContest - Fantasmagoria 14'}</title>

            <meta name="description" content={description}/>

            <meta name="twitter:card" content="summary" />
            <meta name="twitter:site" content="@fireship_dev" />
            <meta name="twitter:title" content='QrContest - Fantasmagoria 14' />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <meta property="og:title" content='QrContest - Fantasmagoria 14' />
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
