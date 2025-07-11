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
                <LinkButton href={Page.LOGIN} className="w-full my-2 backdrop-blur-sm">
                    Zaloguj na konto
                </LinkButton>
                <LinkButton href={Page.REGISTER} className="w-full my-2 backdrop-blur-sm">
                    Dołącz do konkursu
                </LinkButton>
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
                <Panel title="Nagrody w QrContest">
                    <img src="/prize.webp" alt="prize" className="absolute right-0 bottom-0" style={{
                        zIndex: -1,
                        maxHeight: '80%'
                    }}/>
                    <p className="text-2xl">
                        <span className="font-semibold text-text-accent">1. miejsce <br/></span>
                        <span>2x 50 fantów</span>
                    </p>
                    <p className="text-xl pt-3">
                        <span className="font-semibold text-text-accent">2. miejsce <br/> </span>
                        <span>2x 35 fantów</span>
                    </p>
                    <p className="text-lg pt-3">
                        <span className="font-semibold text-text-accent">3. miejsce <br/> </span>
                        <span>2x 20 fantów</span>
                    </p>
                </Panel>

                <Panel title="Co to jest QrContest?" className="text-justify">
                    <p className="pt-1">Twoje zadanie to poszukiwanie kodów QR
                        ukrytych na terenie konwentu. Za każdą dodaną do kolekcji kartę otrzymasz punkty, a im więcej
                        punktów zgromadzisz, tym wyżej znajdziesz się w rankingu. Miejsce na podium gwarantuje
                        fantastyczną nagrodę!</p>
                    <p className="pt-4">Udział w konkursie jest całkowicie darmowy. Wszystko, czego potrzebujesz, to
                        smartfon z dostępem
                        do internetu.</p>
                    <p className="pt-4">Dołącz już teraz używając przycisków powyżej,
                        lub przejdź do &quot;Pytania i odpowiedzi&quot; jeśli chcesz wiedzieć więcej.</p>
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

                <Panel title="Rundy">
                    <p className="text-justify">
                        W każdym konkursie musi być nagroda - a w QrContest mamy ich aż sześć!
                    </p>
                    <p className="mt-2 text-justify">
                        Konkurs podzielony jest na dwie rundy. Daty rozpoczęcia i zakończenia każdej z nich znajdziesz
                        w zakładce &quot;Ranking&quot;. Punkty z rundy pierwszej przechodzą do rundy drugiej,
                        więc masz aż dwie szanse na wygraną! Każda runda to troje zwycięzców.
                    </p>
                    <p className="mt-2 text-justify">
                        Zwycięzców zapraszamy po odbiór nagród do punktu informacyjnego konwentu w momencie
                        zakończenia rundy.
                    </p>
                </Panel>

                <Panel title="Organizatorzy">
                    <p className="text-justify">
                        Organizatorem konkursu &quot;QrContest&quot; na 15. Konwencie Fantastyki Fantasmagoria jest
                        <b> Roman Dąbal.</b>
                    </p>
                    <p className="mt-4 text-justify">
                        Specjalne podziękowania za pomoc w przygotowaniu konkursu kieruję do:
                    </p>
                    <ul className='list-disc list-outside pl-5'>
                        <li><b>Igor S.</b> - Za przygotowanie grafik do kart</li>
                        <li><b>Damian G.</b> - Za inspiracje do wielu z użytych cytatów</li>
                        <li><b>Adam K.</b> - Za fenomenalne pomalowanie statuetek</li>
                        <li><b>Adam A.</b> - Za pomoc techniczną</li>
                        <li><b>Wiktor K.</b> - Za Fantasmagorię!</li>
                    </ul>
                </Panel>
            </div>
            <p className="text-center p-2 w-full text-sm">
                QrContest 2025 - Roman Dąbal dla 15. Konwent Fantastyki Fantasmagoria w Gnieźnie.<br/>
                Wszelkie prawa zastrzeżone.
            </p>
        </main>
    );
}

