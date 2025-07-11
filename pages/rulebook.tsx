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
        'Biorąc udział w konkursie „QrContest - Zbierz je wszystkie!”, dalej określanym jako „konkurs”, akceptujesz warunki tego regulaminu.',
        'Organizatorem konkursu jest Roman Dąbal, dalej określany jako „organizator”.',
        'Warunkiem udziału w konkursie jest zarejestrowanie się w aplikacji konkursowej, dostępnej pod adresem https://fantas.wep.app.',
        'W konkursie może wziąć udział każdy uczestnik konwentu Fantasmagoria 15.',
        'Zwycięzca to osoba, która uzyskała odpowiednią ilość punktów do momentu zakończenia danej tury konkursu. W każdej turze troje uczestników z największą ilością punktów uzyska tytuł zwycięzcy oraz nagrody o wartości zależnej od uzyskanego miejsca.',
        'W konkursie nagrodzonych zostanie sumarycznie 6 osób.',
        'W razie uzyskania przez dwoje uczestników tej samej ilości punktów, osoba która pierwsza zdobyła decydujące punkty jest uznawana za mającą przewagę. Kto pierwszy, ten lepszy.',
        'Nagrody to waluta konwentowa (Fanty), którą uczestnicy mogą wymienić na dowolny przedmiot w sklepiku konwentowym.',
        'Nagrody będzie można odebrać w punkcie informacyjnym konwentu po zakończeniu każdej z tur konkursu.',
        'By odebrać nagrodę należy potwierdzić, że jest się właścicielem konta, które znalazło się w gronie zwycięzców. Można to osiągnąć przez pokazanie aplikacji zalogowanej na konto uczestnika, na ekranie musi być widoczne imię/pseudonim uczestnika oraz ilość uzyskanych punktów.',
        'Konkurs podzielony jest na dwie tury. Pierwsza tura trwa od 14:00 11/07/2025 do 14:00 12/07/2025, druga od 14:00 12/07/2025 do 12:00 13/07/2025.',
        'Uczestnicy nagrodzeni w turze pierwszej nie będą brani pod uwagę przy wyłanianiu zwycięzców w turze drugiej, jednak mogą nadal brać udział w konkursie w celu uzupełnienia swojej kolekcji kart.',
        'Konto użytkownika może zostać zablokowane, gdy uczestnik korzysta z pseudonimu, który może zostać uznany za niecenzuralny lub nieodpowiedni.',
        'Konto użytkownika może zostać zablokowane, gdy uczestnik jest podejrzany o podejmowanie działań niezgodnych z regulaminem.',
        'Niszczenie, przenoszenie lub przywłaszczanie kodów QR jest zabronione i grozi dyskwalifikacją.',
        'W przypadku zauważenia, że któryś z konkursowych kodów został uszkodzony, uczestnicy są proszeni o kontakt z organizatorem. Sposoby kontaktu opisane są w sekcji "Pytania i odpowiedzi" aplikacji konkursowej.',
        'Aplikacja do celów realizacji konkursu zbiera dane takie jak: adres email lub Google ID uczestnika (zależnie od wybranej metody logowania), Imię/Pseudonim, informacje o zgromadzonych kodach, informacje o odpowiedziach na pytania.',
        'Aplikacja korzysta z plików cookie w celu identyfikacji uczestników gry (logowanie / rejestracja), zakładając konto w aplikacji zgadzasz się na ich używanie.',
        'Rejestracja w konkursie jest jednoznaczna z akceptacją wszystkich punktów tego regulaminu, a każdy, kto dokładnie go przeczytał może użyć kodu "PB944GH25M" by zyskać dodatkowe punkty w konkursie.',
        'Organizator zobowiązuje się do przyłożenia wszelkich możliwych starań do zapewnienia bezpieczeństwa i stabilności działania aplikacji konkursowej. Ewentualne błędy w jej działaniu, czasowa niedostępność lub długie czasy ładowania nie są podstawą do roszczeń. W razie wykrycia nieprawidłowości uczestnicy są proszeni o kontakt z organizatorem.',
        'Organizator zastrzega sobie prawo do rozstrzygnięcia spraw, które nie są jednoznacznie określone w regulaminie.'
    ];

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Regulamin</ScreenTitle>
            <Metatags title="Regulamin"/>
            <div>
                <Panel title={'Regulamin QrContest - Zbierz je wszystkie!'}>
                    <ol className='list-decimal list-outside pl-6'>
                        {topics.map((entry, index) => <li key={index} className='pt-1'>{entry}</li>)}
                    </ol>
                </Panel>
            </div>
        </main>
    );
}
