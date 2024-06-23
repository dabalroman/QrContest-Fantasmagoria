import Metatags from '@/components/Metatags';
import React, { useContext, useEffect, useState } from 'react';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import Panel from '@/components/Panel';
import LinkButton from '@/components/LinkButton';
import { Page } from '@/Enum/Page';
import { UserContext, UserContextType } from '@/utils/context';

export default function Home () {
    const [isTopOfThePage, setIsTopOfThePage] = useState<boolean>(true);

    const { user } = useContext<UserContextType>(UserContext);

    useEffect(() => {
        const handleScroll = () => {
            setIsTopOfThePage((document.body.scrollTop || document.documentElement.scrollTop) <= 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });

    useDynamicNavbar({
        onlyCenter: true,
        icon: isTopOfThePage ? faArrowDown : faArrowUp,
        href: isTopOfThePage ? '#readme' : '#top'
    });

    const actionButton = user
        ? <LinkButton href={Page.COLLECT} className="w-full my-2">Przejdź do gry</LinkButton>
        : (
            <div>
                <LinkButton href={Page.LOGIN} className="w-full my-2">Zaloguj</LinkButton>
                <LinkButton href={Page.REGISTER} className="w-full my-2">Zarejestruj</LinkButton>
            </div>
        );

    return (
        <main>
            <Metatags/>
            <div
                className="min-h-screen relative grid items-center justify-center"
                style={{ gridTemplateRows: '100px 1fr 100px' }}
                id="top"
            >
                <div className="p-4 pt-16 max-w-xl">
                    <img src="/fantasmagoria-logo.svg" className="text-text-base" alt="Fantasmagoria Logo"/>
                </div>
                <div className={
                    'text-center flex flex-col justify-center items-center h-64 p-4 bg-overlay-gradient'
                }>
                    <h1 className="text-5xl font-fancy-capitals p-1" style={{ textShadow: '0 4px 4px rgba(0,0,0,0.25)' }}>QrContest</h1>
                    <h2 className="text-2xl font-fancy pb-20" style={{ textShadow: '0 4px 4px rgba(0,0,0,0.25)' }}>
                        Zbierz je wszystkie!
                    </h2>
                </div>
                <div className="absolute bottom-20 w-full p-4">
                    {actionButton}
                </div>
            </div>
            <div
                className="min-h-screen relative grid items-center justify-center p-4"
                style={{ gridTemplateRows: '1fr' }}
                id="readme"
            >
                <Panel title="Nagrody i rundy">
                    <p className="text-center text-lg">
                        1. miejsce – 50 fantów <br/>
                        2. miejsce – 35 fantów <br/>
                        3. miejsce – 20 fantów <br/>
                    </p>
                    <p className="mt-2 text-justify">
                        Konkurs podzielony jest na dwie rundy. Daty rozpoczęcia i zakończenia każdej z nich znajdziesz
                        w zakładce &quot;Ranking&quot;. Punkty z rundy pierwszej przechodzą do rundy drugiej,
                        <b> masz dwie szanse na wygraną!</b> Każda runda to troje zwycięzców.
                    </p>
                    <p className="mt-2 text-justify">
                        Zwycięzców zapraszamy po odbiór nagród w punkcie informacyjnym konwentu w momencie
                        zakończenia trwającej rundy.
                    </p>
                </Panel>

                <Panel title="Karty">
                    <p className="mb-2">
                        Każdy zebrany kod pozwoli Ci na okrycie karty kolekcjonerskiej.
                        Karty te przedstawią Ci historię krainy Erindar. Czy uda Ci się zebrać je wszystkie?
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                        <div
                            className={
                                'border-4 border-card-border rounded-xl bg-background bg-center bg-cover shadow-card'
                            }
                            style={{
                                'backgroundImage': `url(/cards/erindar.webp)`,
                                'height': '8.25rem',
                            }}
                        >
                        </div>
                        <div
                            className={
                                'border-4 border-card-border rounded-xl bg-background bg-center bg-cover shadow-card'
                            }
                            style={{
                                'backgroundImage': `url(/cards/flordraak.webp)`,
                                'height': '8.25rem',
                            }}
                        >
                        </div>
                        <div
                            className={
                                'border-4 border-card-border rounded-xl bg-background bg-center bg-cover shadow-card'
                            }
                            style={{
                                'backgroundImage': `url(/cards/zorza.webp)`,
                                'height': '8.25rem',
                            }}
                        >
                        </div>
                    </div>
                </Panel>

                <Panel title="Czym jest QrContest?" className="text-justify mb-12">
                    <p className="pt-1">QrContest to konkurs, który polega na odkrywaniu i skanowaniu kodów QR
                        rozsianych po terenie konwentu. Za każdy zebrany kod otrzymasz punkty, a im więcej punktów
                        zgromadzisz, tym wyżej znajdziesz się w rankingu. Miejsce na podium gwarantuje fantastyczną
                        nagrodę!</p>
                    <p className="pt-4">Udział w konkursie jest całkowicie darmowy. Wszystko, czego potrzebujesz, to
                        smartfon z dostępem
                        do internetu.</p>
                    <p className="pt-4">Poniżej znajdziesz dodatkowe informacje o konkursie.</p>
                    <LinkButton href={Page.FAQ} className="w-full mt-4">Pytania i odpowiedzi</LinkButton>
                    <LinkButton href={Page.RULEBOOK} className="w-full mt-3">Regulamin konkursu</LinkButton>
                </Panel>
            </div>
        </main>
    );
}

