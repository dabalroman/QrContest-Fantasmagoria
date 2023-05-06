import Head from 'next/head'
import kebabCase from 'lodash.kebabcase';

export default function Home() {
  return (
    <>
      <Head>
        <title>QrContest</title>
        <meta name="description" content="QrContest - Fantasmagoria 13" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="text-3xl font-bold underline">{ kebabCase('Hello world!')}</h1>
      </main>
    </>
  )
}
