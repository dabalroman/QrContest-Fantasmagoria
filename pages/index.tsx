import Metatags from '@/components/Metatags';
import React, {useContext} from 'react';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import Panel from '@/components/Panel';
import LinkButton from '@/components/LinkButton';
import {Page} from '@/Enum/Page';
import {UserContext, UserContextType} from '@/utils/context';
import PinTypeLegend from '@/components/PinTypeLegend';
import AchievementIcon from '@/components/achievements/AchievementIcon';

export default function Home() {
    const {user} = useContext<UserContextType>(UserContext);

    useDynamicNavbar({disabled: true});

    const actionButton = user
        ? <LinkButton href={Page.MAP} className="w-full my-2">Przejdź do gry</LinkButton>
        : (
            <div>
                <LinkButton href={Page.LOGIN} className="w-full my-2 backdrop-blur-sm">
                    Zaloguj się
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
                        Gra Konwentowa
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
                <Panel title="Co to jest Gra Konwentowa?" className="text-justify">
                    <p className="pt-1">Gra Konwentowa to internetowa gra terenowa dla uczestników konwentu
                        fantastyki Fantasmagoria. Otwierasz mapę konwentu, a na niej czekają piny - miejsca,
                        które trzeba odnaleźć i zdobyć. Jeden skrywa ukryty kod QR, drugi zagadkę do
                        rozwiązania, a do trzeciego wystarczy dotrzeć. Za każdy zdobyty
                        pin dostajesz punkty, a im więcej ich zbierzesz, tym wyżej jesteś w rankingu.
                        Miejsce na podium gwarantuje fantastyczną nagrodę!</p>
                    <p className="pt-4">Udział w konkursie jest całkowicie darmowy - wystarczy smartfon
                        z dostępem do internetu.</p>
                    <p className="pt-4">Dołącz już teraz, korzystając z przycisków powyżej. A jeśli chcesz
                        wiedzieć więcej, zajrzyj do sekcji „Pytania i odpowiedzi”.</p>
                    <LinkButton href={Page.FAQ} className="w-full mt-4">Pytania i odpowiedzi</LinkButton>
                    <LinkButton href={Page.RULEBOOK} className="w-full mt-4">Regulamin konkursu</LinkButton>
                </Panel>

                <Panel title="Nagrody w Grze Konwentowej">
                    <img src="/prize.webp" alt="prize" className="absolute right-0 bottom-0" style={{
                        zIndex: -1,
                        maxHeight: '80%'
                    }}/>
                    <p className="text-2xl">
                        <span className="font-semibold text-text-accent">1. miejsce <br/></span>
                        <span>50 fantów</span>
                        <span className="block text-sm">w każdej rundzie</span>
                    </p>
                    <p className="text-xl pt-3">
                        <span className="font-semibold text-text-accent">2. miejsce <br/> </span>
                        <span>35 fantów</span>
                        <span className="block text-sm">w każdej rundzie</span>
                    </p>
                    <p className="text-lg pt-3">
                        <span className="font-semibold text-text-accent">3. miejsce <br/> </span>
                        <span>20 fantów</span>
                        <span className="block text-sm">w każdej rundzie</span>
                    </p>
                </Panel>

                <Panel title="Piny">
                    <p className="mb-4 text-justify">
                        Teren konwentu to dziewięć map, a każdy pin zdobywa się inaczej.
                        Po ikonie od razu poznasz, co trzeba zrobić:
                    </p>

                    <PinTypeLegend/>
                </Panel>

                <Panel title="Osiągnięcia">
                    <p className="text-justify">
                        Za wyczyny w grze zdobywasz odznaki, a każda z nich to dodatkowe punkty. Nagradzamy
                        między innymi zwiedzanie kolejnych zakątków konwentu
                        <AchievementIcon iconKey="map-pin" className="ml-2 text-text-accent"/>,
                        dobre odpowiedzi na pytania
                        <AchievementIcon iconKey="owl" className="mx-2 text-text-accent"/>
                        i kolejne progi punktowe
                        <AchievementIcon iconKey="trophy" className="ml-2 text-text-accent"/>.
                    </p>
                    <p className="mt-2 text-justify">
                        Wszystkie odznaki - te zdobyte i te, które dopiero przed Tobą - znajdziesz
                        w zakładce „Osiągnięcia”.
                    </p>
                </Panel>

                <Panel title="Rundy">
                    <p className="text-justify">
                        W każdym konkursie muszą być nagrody, a w Grze Konwentowej mamy ich aż sześć!
                    </p>
                    <p className="mt-2 text-justify">
                        Konkurs podzielony jest na dwie rundy, a w każdej z nich nagradzamy troje zwycięzców.
                        Punkty z pierwszej rundy przechodzą do drugiej, więc masz aż dwie szanse na wygraną!
                    </p>
                </Panel>

                <Panel title="Organizatorzy">
                    <p className="text-justify">
                        Organizatorem konkursu „Gra Konwentowa” na 16. Konwencie Fantastyki
                        Fantasmagoria jest
                        <b> Roman Dąbal.</b>
                    </p>
                    <p className="mt-4 text-justify">
                        Specjalne podziękowania za pomoc w przygotowaniu konkursu:
                    </p>
                    <ul className='list-disc list-outside pl-5'>
                        <li><b>Maria D.</b> - za narysowanie wszystkich map</li>
                        <li><b>Marcin D.</b> - za zaprojektowanie i wykonanie statuetek dla zwycięzców</li>
                        <li><b>Adam K.</b> - za pomoc w planowaniu i projektowaniu zadań</li>
                        <li><b>Adam A.</b> - za pomoc techniczną</li>
                        <li><b>Wiktor K.</b> - za Fantasmagorię!</li>
                    </ul>
                </Panel>
            </div>
            <p className="text-center p-2 w-full text-sm">
                Gra Konwentowa 2026 - Roman Dąbal dla 16. Konwentu Fantastyki Fantasmagoria w Gnieźnie.<br/>
                Wszelkie prawa zastrzeżone.
            </p>
        </main>
    );
}

