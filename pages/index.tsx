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
                <div className="p-4">
                    <img src="/fantasmagoria-logo.svg" className="text-text-half" alt="Fantasmagoria Logo"/>
                </div>
                <div className={
                    'font-fancy text-center flex flex-col justify-center items-center h-64 p-4 bg-overlay-gradient'
                }>
                    <h1 className="text-4xl p-1" style={{ textShadow: '0 4px 4px rgba(0,0,0,0.25)' }}>QrContest</h1>
                    <h2 className="text-lg pb-20" style={{ textShadow: '0 4px 4px rgba(0,0,0,0.25)' }}>
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
                <Panel title="Czym jest QrContest?" className="text-justify mb-12">
                    <p className="pt-1">QrContest to konkurs, który polega na odkrywaniu i skanowaniu kodów QR
                        rozsianych po terenie konwentu. Za każdy zebrany kod otrzymasz punkty, a im więcej punktów
                        zgromadzisz, tym wyżej znajdziesz się w rankingu. Miejsce na podium gwarantuje fantastyczną
                        nagrodę!</p>
                    <p className="pt-4">Konkurs składa się z dwóch etapów, a punkty zdobyte w pierwszym etapie przenoszą
                        się do drugiego. Troje uczestników z największą ilością punktów na koniec każdego etapu otrzyma
                        cenne nagrody!</p>
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

