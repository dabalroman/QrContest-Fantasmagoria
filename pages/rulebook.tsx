/* eslint-disable max-len */

import ScreenTitle from '@/components/ScreenTitle';
import Metatags from '@/components/Metatags';
import React, { useContext } from 'react';
import Panel from '@/components/Panel';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { UserContext, UserContextType } from '@/utils/context';

export default function RulebookPage () {
    const { user } = useContext<UserContextType>(UserContext);
    const router = useRouter();

    useDynamicNavbar({
        icon: faArrowLeft,
        onClick: () => router.back(),
        onlyCenter: !user
    });

    const topics: string[] = [
        'Biorąc udział w konkursie „Gra Konwentowa - Zbierz je wszystkie!”, dalej określanym jako „konkurs”, akceptujesz warunki tego regulaminu.',
        'Organizatorem konkursu jest Roman Dąbal, dalej określany jako „organizator”.',
        'Warunkiem udziału w konkursie jest zarejestrowanie się w aplikacji konkursowej, dostępnej pod adresem https://fantas.web.app.',
        'W konkursie może wziąć udział każdy uczestnik konwentu Fantasmagoria 16.',
        'Zwycięzca to osoba, która uzyskała odpowiednią liczbę punktów do momentu zakończenia danej rundy konkursu. W każdej rundzie troje uczestników z największą liczbą punktów uzyska tytuł zwycięzcy oraz nagrody o wartości zależnej od uzyskanego miejsca.',
        'W konkursie nagrodzonych zostanie sumarycznie 6 osób.',
        'W razie uzyskania przez dwoje uczestników tej samej liczby punktów, osoba, która pierwsza zdobyła decydujące punkty, jest uznawana za mającą przewagę. Kto pierwszy, ten lepszy.',
        'Nagrody to waluta konwentowa (Fanty), którą uczestnicy mogą wymienić na dowolny przedmiot w sklepiku konwentowym.',
        'Nagrody będzie można odebrać w punkcie informacyjnym konwentu po zakończeniu każdej z rund konkursu.',
        'By odebrać nagrodę, należy potwierdzić, że jest się właścicielem konta, które znalazło się w gronie zwycięzców. Można to osiągnąć przez pokazanie aplikacji zalogowanej na konto uczestnika - na ekranie muszą być widoczne imię/pseudonim uczestnika oraz liczba uzyskanych punktów.',
        'Konkurs podzielony jest na dwie rundy. Pierwsza runda trwa od 14:00 24/07/2026 do 14:00 25/07/2026, druga od 14:00 25/07/2026 do 12:00 26/07/2026.',
        'Uczestnicy nagrodzeni w rundzie pierwszej nie będą brani pod uwagę przy wyłanianiu zwycięzców w rundzie drugiej, jednak mogą nadal brać udział w konkursie w celu zdobywania kolejnych pinezek i osiągnięć.',
        'Konto użytkownika może zostać zablokowane, gdy uczestnik korzysta z pseudonimu, który może zostać uznany za niecenzuralny lub nieodpowiedni.',
        'Konto użytkownika może zostać zablokowane, gdy uczestnik jest podejrzany o podejmowanie działań niezgodnych z regulaminem.',
        'Niszczenie, przenoszenie lub przywłaszczanie elementów konkursu (w tym kodów QR) jest zabronione i grozi dyskwalifikacją.',
        'W przypadku zauważenia, że któryś z elementów konkursu (w tym kodów QR) został uszkodzony, uczestnicy są proszeni o kontakt z organizatorem. Sposoby kontaktu opisane są w sekcji „Pytania i odpowiedzi” aplikacji konkursowej.',
        'Aplikacja do celów realizacji konkursu zbiera dane takie jak: adres e-mail lub Google ID uczestnika (zależnie od wybranej metody logowania), Imię/Pseudonim, informacje o zdobytych pinezkach, informacje o odpowiedziach na pytania oraz przesłane zdjęcia.',
        'Aplikacja korzysta z plików cookie w celu identyfikacji uczestników gry (logowanie / rejestracja). Zakładając konto w aplikacji, zgadzasz się na ich używanie.',
        'Rejestracja w konkursie jest jednoznaczna z akceptacją wszystkich punktów tego regulaminu, a każdy, kto dokładnie go przeczytał, może użyć kodu „PB944GH25M”, by zyskać dodatkowe punkty w konkursie.',
        'Organizator zobowiązuje się do przyłożenia wszelkich możliwych starań do zapewnienia bezpieczeństwa i stabilności działania aplikacji konkursowej. Ewentualne błędy w jej działaniu, czasowa niedostępność lub długie czasy ładowania nie są podstawą do roszczeń. W razie wykrycia nieprawidłowości uczestnicy są proszeni o kontakt z organizatorem.',
        'Organizator zastrzega sobie prawo do rozstrzygnięcia spraw, które nie są jednoznacznie określone w regulaminie.'
    ];

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Regulamin</ScreenTitle>
            <Metatags title="Regulamin"/>
            <div>
                <Panel title={'Regulamin „Gra Konwentowa - Zbierz je wszystkie!”'}>
                    <ol className='list-decimal list-outside pl-6'>
                        {topics.map((entry, index) => <li key={index} className='pt-1'>{entry}</li>)}
                    </ol>
                </Panel>
            </div>
        </main>
    );
}
