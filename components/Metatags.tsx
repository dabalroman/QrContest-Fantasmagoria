import Head from 'next/head';

export default function Metatags({
    title = 'QrContest - Fantasmagoria 13',
    description = 'QrContest - Fantasmagoria 13',
    image = '',
}) {
    return (
        <Head>
            <title>{`${title} - QrContest - Fantasmagoria 13`}</title>

            <meta name="description" content={description}/>

            <meta name="twitter:card" content="summary" />
            <meta name="twitter:site" content="@fireship_dev" />
            <meta name="twitter:title" content='QrContest - Fantasmagoria 13' />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <meta property="og:title" content='QrContest - Fantasmagoria 13' />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="color-scheme" content="light only"/>
            <link rel="icon" href="/favicon.ico"/>
        </Head>
    );
}
