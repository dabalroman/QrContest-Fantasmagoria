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
            question: 'Gdzie mogę znaleźć karty?',
            answer: 'Kody QR zostały ukryte na terenie konwentu - na zewnątrz, wewnątrz, w korytarzach, a nawet w miejscach, które mogą Cię zaskoczyć! Jednakże, aby nie zakłócać innych atrakcji konwentu, kody nie zostaną ukryte w salach prelekcyjnych.'
        },
        {
            question: 'Jak mogę zdobyć punkty?',
            answer: 'Każde zebranie karty dodaje punkty do Twojego konta. Pod niektórymi kodami kryją się również pytania, na które odpowiedź daje dodatkowe punkty.'
        },
        {
            question: 'Czy mogę zeskanować ten sam kod QR wielokrotnie?',
            answer: 'Możesz próbować, ale nie przyniesie to skutku.'
        },
        {
            question: 'Czy mogę brać udział w drugiej turze, jeśli zdobyłem/am nagrodę w pierwszej?',
            answer: 'Tak, ale nie będziesz mógł/mogła zdobyć nagrody. Możesz dalej skanować kody, by zdobyć wszystkie możliwe karty w kolekcji.'
        },
        {
            question: 'Czy punkty z pierwszej tury przechodzą do drugiej tury?',
            answer: 'Tak, pod warunkiem, że nie zdobyłeś/aś nagrody w pierwszej turze.'
        },
        {
            question: 'Jakie są nagrody w konkursie?',
            answer: 'Nagrody czekają na trzech uczestników z największą ilością punktów w każdej turze. Nagrodami są punkty konwentowe nazywane “Fanty”, które można wymienić na gadżety w sklepiku.'
        },
        {
            question: 'Skąd mam wiedzieć, czy wygrałem/am?',
            answer: 'Po zakończeniu każdej tury, w aplikacji pojawia się informacja o zwycięzcach. Możesz ją sprawdzić, aby dowiedzieć się, czy jesteś jednym z nich.'
        },
        {
            question: 'Gdzie mogę zobaczyć swoją kolekcję kart?',
            answer: 'Twoja kolekcja kart jest widoczna w galerii w aplikacji konkursowej.'
        },
        {
            question: 'Czy mogę zobaczyć ilustracje na kartach, zanim zeskanuję kod QR?',
            answer: 'Nie, ilustracje są widoczne tylko po zeskanowaniu kodu QR.'
        },
        {
            question: 'Jak długo trwa każda tura?',
            answer: 'Pierwsza tura trwa od początku konwentu do soboty o 14:00. Druga tura rozpoczyna się w sobotę o 14:00 i kończy w niedzielę o 12:00.'
        },
        {
            question: 'Gdzie mogę sprawdzić, ile punktów zdobyłem/am?',
            answer: 'Ilość Twoich punktów jest widoczna w aplikacji konkursowej na ekranach ranking i profil.'
        },
        {
            question: 'Czy aplikacja konkursowa jest dostępna na wszystkich urządzeniach?',
            answer: 'Tak, aplikacja konkursowa jest dostępna jako strona internetowa i może być uruchomiona na każdym urządzeniu z dostępem do internetu.'
        },
        {
            question: 'Kiedy i gdzie rozdawane będą nagrody?',
            answer: 'Nagrody będą rozdawane w punkcie informacyjnym po zakończeniu każdej tury.'
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
            question: 'Czym są kluby?',
            answer: 'System klubów to społeczny element konkursu, który pozwala uczestnikom na dołączanie do jednego z czterech dostępnych klubów. Wybierzesz jedną z nich przy rejestracji swojego konta. Wybór klubu jest czysto kosmetyczny i nie wpływa na Twoje szanse na wygraną.'
        },
        {
            question: 'Czy w sekcji FAQ kryje się kod?',
            answer: 'Nie. Na pewno nie jest to "9DG76W9SGN". A już na pewno nie pisany od tyłu.'
        },
        {
            question: 'Czy mogę zmienić klub?',
            answer: 'Tak, możesz zmienić klub raz na 4 godziny. Możesz skorzystać z tej opcji, jeśli zdecydujesz, że chciałbyś należeć do innego klubu.'
        },
        {
            question: 'Jak jest wyliczany wynik klubu?',
            answer: 'Moc klubu jest obliczana jako średnia punktów wszystkich jej członków. To oznacza, że każdy uczestnik ma wkład w sukces swojego klubu, niezależnie od tego, ile punktów zdobył.'
        },
        {
            question: 'Czy mogę zbierać karty wspólnie z przyjacielem?',
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
                        &quot;QrContest - Zbierz je wszystkie!&quot;
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
