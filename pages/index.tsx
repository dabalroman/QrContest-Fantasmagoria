import Metatags from '@/components/Metatags';
import React, {useContext} from 'react';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import Panel from '@/components/Panel';
import LinkButton from '@/components/LinkButton';
import {Page} from '@/Enum/Page';
import {UserContext, UserContextType} from '@/utils/context';

export default function Home() {
    const {user} = useContext<UserContextType>(UserContext);

    useDynamicNavbar({disabled: true});

    const actionButton = user
        ? <LinkButton href={Page.COLLECT} className="w-full my-2">Przejdź do gry</LinkButton>
        : (
            <div>
                <LinkButton href={Page.LOGIN} className="w-full my-2">Zaloguj na konto</LinkButton>
                <LinkButton href={Page.REGISTER} className="w-full my-2">Dołącz do konkursu</LinkButton>
            </div>
        );

    return (
        <main className='w-full'>
            <Metatags/>
            <div
                className="grid items-center justify-center text-text-accent w-full"
                style={{gridTemplateRows: '100px 1fr 200px', minHeight: '80vh'}}
                id="top"
            >
                <div className="p-4 max-w-xl">
                    <img src="/fantasmagoria-logo.svg" alt="Fantasmagoria Logo"/>
                </div>
                <div className={
                    'text-center flex flex-col justify-center items-center p-4'
                }>
                    <h1 className="text-6xl font-fancy-capitals p-1"
                        style={{textShadow: '0 4px 4px rgba(0,0,0,0.25)'}}
                    >
                        QrContest
                    </h1>
                    <h2 className="text-3xl font-fancy" style={{textShadow: '0 4px 4px rgba(0,0,0,0.25)'}}>
                        Zbierz je wszystkie!
                    </h2>
                </div>
                <div className="w-full p-4">
                    {actionButton}
                </div>
            </div>
            <div
                className="min-h-screen relative grid items-center justify-center p-4"
                style={{gridTemplateRows: '1fr'}}
                id="readme"
            >
                <Panel title="Co to jest QrContest?" className="text-justify">
                    <p className="pt-1">QrContest to konkurs, który polega na szukaniu i skanowaniu kodów QR
                        ukrytych na terenie konwentu. Za każdą dodaną do kolekcji kartę otrzymasz punkty, a im więcej
                        punktów zgromadzisz, tym wyżej znajdziesz się w rankingu. Miejsce na podium gwarantuje
                        fantastyczną nagrodę!</p>
                    <p className="pt-4">Udział w konkursie jest całkowicie darmowy. Wszystko, czego potrzebujesz, to
                        smartfon z dostępem
                        do internetu.</p>
                    <p className="pt-4">Poniżej znajdziesz dodatkowe informacje o konkursie.</p>
                    <LinkButton href={Page.FAQ} className="w-full mt-4">Pytania i odpowiedzi</LinkButton>
                    <LinkButton href={Page.RULEBOOK} className="w-full mt-4">Regulamin konkursu</LinkButton>
                </Panel>

                <Panel title="Karty">
                    <p className="mb-4">
                        W tym roku Twoim celem są znane cytaty! Każda karta to para unikalnej grafiki oraz genialnego
                        tekstu, który odbił się szerokim echem w popkulturze. W Twojej kolekcji znajdziesz takie
                        klasyki jak &quot;Niebieski kwiat i kolce&quot;, &quot;Jak to jest być skrybą?&quot; 
                        czy &quot;I&apos;m groot&quot;. Do znalezienia są aż 64 karty, więc pora ruszyć na łowy!
                    </p>

                    <div className="grid grid-cols-3 gap-4 justify-items-center">
                        <div
                            className={
                                'border-4 border-card-common rounded-xl bg-background bg-center bg-cover shadow-card'
                            }
                            style={{
                                'backgroundImage': `url(/cards-thumbnails/luke-iam-your-thumbnail.webp)`,
                                'height': '8.25rem',
                                'aspectRatio': '2/3'
                            }}
                        >
                        </div>
                        <div
                            className={
                                'border-4 border-card-rare rounded-xl bg-background bg-center bg-cover shadow-card'
                            }
                            style={{
                                'backgroundImage': `url(/cards-thumbnails/the-one-piece-thumbnail.webp)`,
                                'height': '8.25rem',
                                'aspectRatio': '2/3',
                            }}
                        >
                        </div>
                        <div
                            className={
                                'border-4 border-card-epic rounded-xl bg-background bg-center bg-cover shadow-card'
                            }
                            style={{
                                'backgroundImage': `url(/cards-thumbnails/potezna-wichura-lamiac-thumbnail.webp)`,
                                'height': '8.25rem',
                                'aspectRatio': '2/3',
                            }}
                        >
                        </div>
                    </div>
                </Panel>

                <Panel title="Nagrody i rundy" className='mb-12'>
                    <p className="text-justify">
                        W każdym konkursie musi być nagroda - a w QrContest mamy ich aż sześć!
                    </p>
                    <p className="mt-4 text-center text-lg">
                        <span className='text-xl font-semibold text-text-accent tracking-wider'>
                            1. miejsce – 50 fantów
                        </span><br/>
                        <span className='text-xl'>2. miejsce – 35 fantów</span><br/>
                        <span className='text-md'>3. miejsce – 20 fantów</span><br/>
                    </p>
                    <p className="mt-4 text-justify">
                        Konkurs podzielony jest na dwie rundy. Punkty z rundy pierwszej przechodzą do rundy
                        drugiej,&nbsp;
                        co oznacza, że <span className={'underline'}>masz dwie szanse na wygraną!</span>&nbsp;
                        Każda z tur wyłoni troje zwycięzców.
                    </p>
                    <p className="mt-4 text-justify">
                        Zwycięzców zapraszamy po odbiór nagród do punktu informacyjnego konwentu w momencie
                        zakończenia rundy.
                    </p>
                </Panel>
            </div>
        </main>
    );
}

