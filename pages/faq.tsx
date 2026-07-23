/* eslint-disable max-len */

import ScreenTitle from '@/components/ScreenTitle';
import Metatags from '@/components/Metatags';
import React, {useContext} from 'react';
import Panel from '@/components/Panel';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {useRouter} from 'next/router';
import {UserContext, UserContextType} from '@/utils/context';

export default function FaqPage() {
    const {user} = useContext<UserContextType>(UserContext);
    const router = useRouter();

    useDynamicNavbar({
        icon: faArrowLeft,
        onClick: () => router.back(),
        onlyCenter: !user
    });

    const topics: { question: string, answer: string }[] = [
        {
            question: 'Jak mogę wziąć udział w konkursie?',
            answer: 'Zeskanuj jeden z kodów QR za pomocą smartfona, a zostaniesz przeniesiony/a do formularza rejestracyjnego.'
        },
        {
            question: 'Jak korzystać z mapy?',
            answer: 'Mapa to główny ekran gry - od niej zaczynasz zabawę. Teren konwentu podzielony jest na dziewięć map i możesz swobodnie przełączać się między nimi. Zaznaczone na mapach pinezki to miejsca do zdobycia - dotknij pinezki, aby zobaczyć, co trzeba zrobić. Zdobyte pinezki są wyszarzone, więc od razu widać, co jeszcze zostało do odkrycia.'
        },
        {
            question: 'Czym są pinezki?',
            answer: 'Pinezki to zaznaczone na mapie miejsca, a każdą z nich zdobywa się inaczej. Jedna wymaga zeskanowania ukrytego kodu QR, druga rozwiązania zagadki, trzecia dotarcia na miejsce, czwarta oceny wysłuchanej prelekcji, a piąta przysłania zdjęcia. Sposób zdobycia rozpoznasz po ikonie pinezki, a szczegóły znajdziesz w opisie, który pojawi się po jej dotknięciu.'
        },
        {
            question: 'Gdzie mogę znaleźć pinezki?',
            answer: 'Wszystkie pinezki są zaznaczone na mapie konwentu. Część z nich prowadzi do ukrytych kodów QR - mapa pokazuje wtedy okolicę, w której warto ich szukać. Kody czekają na zewnątrz, wewnątrz, w korytarzach, a nawet w miejscach, które mogą Cię zaskoczyć! Jednakże, aby nie zakłócać innych atrakcji konwentu, kody nie zostaną ukryte w salach prelekcyjnych.'
        },
        {
            question: 'Jak mogę zdobyć punkty?',
            answer: 'Każde zdobycie pinezki dodaje punkty do Twojego konta. Przy niektórych pinezkach pojawia się dodatkowo pytanie - za poprawną odpowiedź otrzymasz kolejne punkty. Punkty przyznajemy również za zdobyte osiągnięcia.'
        },
        {
            question: 'Czym są osiągnięcia?',
            answer: 'Osiągnięcia to odznaki przyznawane za wyczyny w grze - między innymi za zwiedzanie kolejnych zakątków konwentu, wiedzę wykazaną w pytaniach czy kolejne progi zdobytych punktów. Każda odznaka to dodatkowe punkty. Wszystkie odznaki - te zdobyte i te, które dopiero przed Tobą - znajdziesz w zakładce „Osiągnięcia”.'
        },
        {
            question: 'Jak działają pinezki ze zdjęciem?',
            answer: 'Przy takiej pinezce robisz zdjęcie i przesyłasz je prosto z aplikacji do organizatora. Punkty otrzymasz dopiero wtedy, gdy je zatwierdzi. Do tego czasu przy Twoim wyniku w rankingu widoczna jest informacja „+X oczekuje na weryfikację”. Jeśli zdjęcie nie zostanie przyjęte, pinezka wraca na mapę i możesz spróbować jeszcze raz.'
        },
        {
            question: 'Jak ocenić prelekcję?',
            answer: 'Przy salach prelekcyjnych znajdziesz pinezki do oceny prelekcji. Gdy wysłuchasz jednej z nich, dotknij takiej pinezki, wpisz jej nazwę i przyznaj od jednej do pięciu gwiazdek. Przy tych pinezkach nie pojawia się pytanie - punkty otrzymasz od razu po wysłaniu oceny.'
        },
        {
            question: 'Czy mogę zdobyć tę samą pinezkę wielokrotnie?',
            answer: 'Możesz próbować, ale nie przyniesie to skutku.'
        },
        {
            question: 'Czy mogę brać udział w drugiej rundzie, jeśli zdobyłem/am nagrodę w pierwszej?',
            answer: 'Tak, ale nie będziesz mógł/mogła zdobyć nagrody. Możesz dalej zdobywać pinezki i osiągnięcia.'
        },
        {
            question: 'Czy punkty z pierwszej rundy przechodzą do drugiej rundy?',
            answer: 'Tak, pod warunkiem, że nie zdobyłeś/aś nagrody w pierwszej rundzie.'
        },
        {
            question: 'Jakie są nagrody w konkursie?',
            answer: 'Nagrody czekają na trzech uczestników z największą ilością punktów w każdej rundzie. Nagrodami są punkty konwentowe nazywane “Fanty”, które można wymienić na gadżety w sklepiku.'
        },
        {
            question: 'Skąd mam wiedzieć, czy wygrałem/am?',
            answer: 'Po zakończeniu każdej rundy, w aplikacji pojawia się informacja o zwycięzcach. Możesz ją sprawdzić, aby dowiedzieć się, czy jesteś jednym z nich.'
        },
        {
            question: 'Jak długo trwa każda runda?',
            answer: 'Pierwsza runda trwa od 14:00 24/07/2026 do 14:00 25/07/2026, a druga od 14:00 25/07/2026 do 12:00 26/07/2026.'
        },
        {
            question: 'Gdzie mogę sprawdzić, ile punktów zdobyłem/am?',
            answer: 'Liczba Twoich punktów jest widoczna w aplikacji konkursowej w zakładkach „Ranking” oraz „Konto”.'
        },
        {
            question: 'Czy aplikacja konkursowa jest dostępna na wszystkich urządzeniach?',
            answer: 'Tak, aplikacja konkursowa jest dostępna jako strona internetowa i może być uruchomiona na każdym urządzeniu z dostępem do internetu.'
        },
        {
            question: 'Kiedy i gdzie rozdawane będą nagrody?',
            answer: 'Nagrody będą rozdawane w punkcie informacyjnym po zakończeniu każdej rundy.'
        },
        {
            question: 'Które miejsce w konkursie zajmuję?',
            answer: 'Możesz sprawdzić swoje miejsce w aplikacji konkursowej, gdzie na bieżąco aktualizowany jest ranking uczestników.'
        },
        {
            question: 'Nie mogę się zalogować, co mam zrobić?',
            answer: 'W razie problemów z logowaniem, skontaktuj się z organizatorem konkursu.'
        },
        {
            question: 'Czego potrzebuję do odebrania nagrody?',
            answer: 'Do odebrania nagrody potrzebujesz smartfona z zalogowaną aplikacją konkursową. Pokaż swoje konto przy odbiorze nagrody.'
        },
        {
            question: 'Czy w sekcji FAQ kryje się kod?',
            answer: 'Nie. Na pewno nie jest to "9DG76W9SGN". A już na pewno nie pisany od tyłu.'
        },
        {
            question: 'Czy mogę zdobywać pinezki wspólnie z przyjacielem?',
            answer: 'Tak, ale pamiętaj, że jedno konto to zawsze tylko jedna nagroda.'
        },
        {
            question: 'Na jakich urządzeniach mogę korzystać z aplikacji konkursowej?',
            answer: 'Aplikacja przeszła testy na smartfonach z systemem Android oraz iOS, na przeglądarkach Chrome, Firefox i Safari. Może działać na innych urządzeniach, ale nie możemy zagwarantować pełnej kompatybilności.'
        }
    ];

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>FAQ</ScreenTitle>
            <Metatags title="FAQ"/>
            <div>
                <Panel title={'Pytania i odpowiedzi'}>
                    <p className="text-justify">
                        Tu znajdziesz listę pytań i odpowiedzi na różne aspekty konkursu
                        &quot;Gra Konwentowa - Zbierz je wszystkie!&quot;
                        W razie potrzeby możesz skontaktować się bezpośrednio z organizatorem konkursu przez
                        email <a href="mailto:dabalroman@gmail.com" className="underline">dabalroman@gmail.com</a> lub
                        przez <a href="https://m.me/roman.dabal" className="underline">messenger</a>.
                    </p>
                </Panel>
                {topics.map(({
                    question,
                    answer
                }) => (
                    <Panel key={question}>
                        <p className={'text-xl mb-3'}>{question}</p>
                        <p>{answer}</p>
                    </Panel>
                ))}
            </div>
        </main>
    );
}
