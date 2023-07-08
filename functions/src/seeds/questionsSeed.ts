/* eslint-disable max-len */
import { FieldValue } from 'firebase-admin/firestore';
import { Question } from '../types/question';

const questionsSeed: Question[] = [
    {
        uid: 'jak-nazywa-sie-gra',
        question: 'Jak nazywa się gra, w której zapisujesz słowo flamastrem na tabliczce?',
        answers: {
            a: 'Jednym słowem',
            b: 'Tajniacy',
            c: 'Czółko',
            d: 'Mistrz słowa'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'kiedy-zostala-zbudowana-slynna',
        question: 'Kiedy została zbudowana słynna Maszyna Turinga?',
        answers: {
            a: 'Nie została',
            b: '1942',
            c: '1944',
            d: '1950'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'czym-bylo-lustro-archimedesa',
        question: 'Czym było Lustro Archimedesa?',
        answers: {
            a: 'Potężną bronią, której zadaniem było spalenie wrogów żywcem poprzez wykorzystanie energii słonecznej',
            b: 'Lustrem ukazującym najgłębsze, najbardziej utęsknione pragnienia naszego serca',
            c: 'Urządzenie zbudowane z solenoidu lub baterii solenoidów, które rozpędza przedmioty wykonane z ferromagnetyka dzięki polu magnetycznemu wytworzonemu przez prąd elektryczny przepływający przez solenoid',
            d: 'Lustrem podarowanym Juliszowi Cezarowi przez jego syna w Asterixie i Obelixie'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'ktory-z-podanych-tytulow',
        question: 'Który z podanych tytułów mang ma najwięcej sprzedanych egzemplarzy?',
        answers: {
            a: 'Golgo 13',
            b: 'Demon Slayer',
            c: 'Tensei shittara slime date ken',
            d: 'Attack on titan'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'czego-do-przemiany-potrzebuje',
        question: 'Czego do przemiany potrzebuje Holo z Spice and Wolf?',
        answers: {
            a: 'Nasion pszenicy',
            b: 'Nasion słonecznika',
            c: 'Srebrnych monet',
            d: 'Jabłek'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'gdzie-znajduje-sie-60',
        question: 'Gdzie znajduje się 60 wieża NTE? (Manga: Dimension W)',
        answers: {
            a: 'Isla',
            b: 'Japonia',
            c: 'Wyspa Wielkanocna',
            d: 'Indie'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'jak-sie-nazywa-studio',
        question: 'Jak się nazywa studio, które w portfolio ma takie dzieła jak "Violet Evergarden", "Hibike! Euphonium", "K-On!"?',
        answers: {
            a: 'Kyoto Animation',
            b: 'P.A. Works',
            c: 'White Fox',
            d: 'A-1 Pictures'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'o-czym-opowiada-film',
        question: 'O czym opowiada film "Kimi no Suizou wo Tabetai/I Want To Eat Your Pancreas"?',
        answers: {
            a: 'O cieszeniu się życiem',
            b: 'O miłości zombie',
            c: 'O gotowaniu',
            d: 'O wspomnieniach z II WŚ'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'na-jakiej-postaci-jest',
        question: 'Na jakiej postaci jest wzorowany Rider/Iskander w "Fate/Zero"?',
        answers: {
            a: 'Na Aleksandrze Wielkim',
            b: 'Na Królu Leonidasie I',
            c: 'Na Kratosie',
            d: 'Na Thorze'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'ktory-robot-jest-autorem',
        question: 'Który robot jest autorem słów "I\'m Sorry Dave, I\'m afraid I can\'t Do that"?',
        answers: {
            a: 'HAL 9000',
            b: 'C3PO',
            c: 'T-1000',
            d: 'Optimus Prime'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'jakie-zwierze-bylo-przyjacielem',
        question: 'Jakie zwierzę było przyjacielem robota WALL-E?',
        answers: {
            a: 'Karaluch',
            b: 'Żuk',
            c: 'Ptak',
            d: 'Mysz'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'jaki-pseudonim-sceniczny-ma',
        question: 'Jaki pseudonim sceniczny ma główna bohaterka Paripi Koumei?',
        answers: {
            a: 'Eiko',
            b: 'Mia',
            c: 'Nanami',
            d: 'Kung Fu'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'w-ktorym-z-podanych',
        question: 'W którym z podanych anime występuje motyw supermocy/nadludzkich umiejętności?',
        answers: {
            a: 'Wszytskie odpowiedzi są poprawne!',
            b: 'Boku No Hero Academia',
            c: 'Bungou Stray Dogs',
            d: 'Jujutsu Kaisen'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'czym-smierdzial-ojciec-artura',
        question: 'Czym śmierdział ojciec Artura według Francuzów w "Monty Python i Święty Graal"?',
        answers: {
            a: 'Czarnym Bzem',
            b: 'Chomikiem',
            c: 'Borówkami',
            d: 'Snobstwem'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'ile-lat-trwa-nauka',
        question: 'Ile lat trwa nauka w Hogwarcie?',
        answers: {
            a: '7',
            b: '6',
            c: '8',
            d: '5'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'kto-w-hogwarcie-uczyl',
        question: 'Kto w Hogwarcie uczył przyrządzania eliksirów, a później obrony przed czarną magią?',
        answers: {
            a: 'Severus Snape',
            b: 'Remus Lupin',
            c: 'Minerva McGonagall',
            d: 'Newt Scamander'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'do-ktorego-roku-przeniosl',
        question: 'Do którego roku przeniósł się Marty McFly w "Powrocie do przyszłości 2"?',
        answers: {
            a: '2015',
            b: '2010',
            c: '2020',
            d: '2025'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'kto-zostal-mezem-sansy',
        question: 'Kto został mężem Sansy Stark?',
        answers: {
            a: 'Tyrion Lannister',
            b: 'Jon Snow',
            c: 'Robb Stark',
            d: 'Robert Baratheon'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'kolorami-jakiego-domu-w',
        question: 'Kolorami jakiego domu w Hogwarcie są żółty i czarny?',
        answers: {
            a: 'Hufflepuff',
            b: 'Gryffindor',
            c: 'Slytherin',
            d: 'Ravenclaw'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'w-jakim-filmie-kinowym',
        question: 'W jakim filmie kinowym w 2013 roku zagrali Martin Freeman i Benedict Cumberbatch - czyli serialowy Sherlock i Watson?',
        answers: {
            a: 'Hobbit. Pustkowie Smauga',
            b: 'The Conjuring',
            c: 'Oblivion',
            d: 'Thor: The Dark World'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'jak-bilbo-baggins-nazwal',
        question: 'Jak Bilbo Baggins nazwał swój miecz?',
        answers: {
            a: 'Żądło',
            b: 'Osa',
            c: 'Kieł',
            d: 'Kolec'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'co-lewis-carroll',
        question: 'Co Lewis Carroll (a właściwie Charles Lutwidge Dodgson), autor "Alicji w Krainie Czarów" wykładał na uniwersytecie?',
        answers: {
            a: 'Matematykę',
            b: 'Literaturę',
            c: 'Psychologię',
            d: 'Politologię'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'jakim-srodkiem-transportu-poruszala',
        question: 'Jakim środkiem transportu poruszała się Celty z anime "Durarara"?',
        answers: {
            a: 'Motocyklem',
            b: 'Pickupem',
            c: 'Rowerem',
            d: 'Helikopterem'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'jak-dziala-ikonoskop',
        question: 'Jak działa ikonoskop - urządzenie, którym posługiwał się Dwukwiat, pierwszy turysta Świat Dysku?',
        answers: {
            a: 'W środku siedzi chochlik, który maluje obrazki.',
            b: 'Urządzenie działa jak szkło powiększające.',
            c: 'Zapisuje obrazy na elektronowych kryształkach.',
            d: 'Pozwala na dostęp do wielkiej biblioteki Trionów.'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'autorem-ktorej-z-wymienionych',
        question: 'Autorem której z wymienionych powieści jest Phillip K. Dick?',
        answers: {
            a: 'Pamięć absolutna',
            b: 'Niezwyciężony',
            c: 'Ziemomorze',
            d: 'Pieśń ludu i ognia'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'ktory-z-filmow-ze',
        question: 'Który z filmów ze Studia Ghibli zdobył Oskara?',
        answers: {
            a: 'Spirited Away: W krainie bogów',
            b: 'Mój sąsiad Totoro',
            c: 'Opowieści z Ziemiomorza',
            d: 'Księżniczka Kaguya'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'ktory-z-polskich-autorow',
        question: 'Który z polskich autorów fantastyki 19 tomów kontynuacji cyklu „Pan Samochodzik”?',
        answers: {
            a: 'Andrzej Pilipiuk',
            b: 'Andrzej Sapkowski',
            c: 'Maja Lidia Kossakowska',
            d: 'Stanisław Lem'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'jak-nazywal-sie-czarny',
        question: 'Jak nazywał się czarny kot z serialu „Siedem życzeń?',
        answers: {
            a: 'Rademenes',
            b: 'Ramzes',
            c: 'Roger',
            d: 'Rufus'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'w-jakim-uniwersum-osadzony',
        question: 'W jakim uniwersum osadzony był pierwszy LARP zorganizowany przez Klub Fantastyki Fantasmagoria?',
        answers: {
            a: 'Neuroshima',
            b: 'Pokemon World',
            c: 'Sword Art Online',
            d: 'Spirited Away'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'glownym-bohaterem-jakiego-serialu',
        question: 'Głównym bohaterem jakiego serialu jest Ragnar Lothbrock?',
        answers: {
            a: 'Wikingowie',
            b: 'Game of thrones',
            c: 'Supernatural',
            d: 'Ragnarok'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'z-jakiej-planety-pochodzi',
        question: 'Z jakiej planety pochodzi Superman?',
        answers: {
            a: 'Krypton',
            b: 'Mars',
            c: 'Arrakis',
            d: 'Alderaan'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'kto-gral-conana-barbarzynce',
        question: 'Kto grał Conana Barbarzyńcę w filmie z 1982 roku?',
        answers: {
            a: 'Arnold Schwarzenegger',
            b: 'Robert De Niro',
            c: 'Christopher Walken',
            d: 'Harrison Ford'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'ktory-z-amerykanskich-prezydentow',
        question: 'Który z amerykańskich prezydentów w filmie został łowcą wampirów?',
        answers: {
            a: 'Abraham Lincoln',
            b: 'Bill Clinton',
            c: 'Ronald Regan',
            d: 'John F. Kennedy'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'kto-napisal-ksiazki:',
        question: 'Kto napisał książki: „Nigdziebądź”, „Gwiezdny Pył”, „Ocean na końcu drogi”?',
        answers: {
            a: 'Neil Gaiman',
            b: 'Patrick Rothfuss',
            c: 'George R. R. Martin',
            d: 'Andrzej Sapkowski'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 15
    },
    {
        uid: 'jak-ma-na-imie',
        question: 'Jak ma na imię kamerdyner Bruce\'a Wayne\'a?',
        answers: {
            a: 'Alfred',
            b: 'Robin',
            c: 'Rudolf',
            d: 'Tony'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'zmierzch-dlaczego-edward',
        question: 'Zmierzch: Dlaczego Edward przemienia Bellę w wampira?',
        answers: {
            a: 'Inaczej groziła jej śmierć podczas porodu.',
            b: 'Z powodu ciężkiej choroby.',
            c: 'Z powodu nienawiści do ludzi.',
            d: 'Był to czysty przypadek.'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'czego-poszukuje-tytulowy-bohater',
        question: 'Czego poszukuje tytułowy bohater w filmie „Indiana Jones i ostatnia krucjata”?',
        answers: {
            a: 'Świętego Graala',
            b: 'Kryształowej czaszki',
            c: 'Pradawnych zwojów',
            d: 'Arki przymierza'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'jakiej-narodowosci-jest-simon',
        question: 'Jakiej narodowości jest Simon z anime „Durarara”?',
        answers: {
            a: 'Rosjanin',
            b: 'Polak',
            c: 'Japończyk',
            d: 'Amerykanin'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'kto-dubbinguje-w-polskiej',
        question: 'Kto dubbinguje w polskiej wersji Osła w „Shreku”?',
        answers: {
            a: 'Jerzy Stuhr',
            b: 'Cezary Pazura',
            c: 'Piotr Fronczewski',
            d: 'Jarosław Boberek'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'kim-jest-david-z',
        question: 'Kim jest David z filmu „Prometeusz?',
        answers: {
            a: 'Androidem',
            b: 'Obcym',
            c: 'Człowiekiem',
            d: 'Programem komuputerowym'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'ktora-z-ksiezniczek-nie',
        question: 'Która z księżniczek nie była kandydatką na żonę dla Lorda Farquada?',
        answers: {
            a: 'Roszpunka',
            b: 'Fiona',
            c: 'Kopciuszek',
            d: 'Śpiąca królewna'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'kto-byl-wrogiem-shreka',
        question: 'Kto był wrogiem Shreka w pierwszej cześci filmu?',
        answers: {
            a: 'Lord Farquad',
            b: 'Wróżka chrzestna',
            c: 'Książę z bajki',
            d: 'Rumpelsiltskin'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'ile-dzieci-mieli-shrek',
        question: 'Ile dzieci mieli Shrek z Fioną?',
        answers: {
            a: '3',
            b: '2',
            c: '5',
            d: '10'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'dlaczego-ogry-sa-jak',
        question: 'Dlaczego ogry są jak cebule?',
        answers: {
            a: 'Bo mają warstwy',
            b: 'Bo cuchną',
            c: 'Bo wywołują płacz',
            d: 'Bo wieśniacy mają z nimi do czynienia'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'co-mial-znalezc-osiol',
        question: 'Co miał znaleźć Osioł, gdy Shrek został postrzelony?',
        answers: {
            a: 'Niebieski kwiat z kolcami',
            b: 'Pokrzywę',
            c: 'Żółte róże',
            d: 'Borówki'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'jaka-nazwe-nosil-rozkaz',
        question: 'Jaką nazwę nosił rozkaz, który miały wykonać wszystkie klony Republiki?',
        answers: {
            a: 'Rozkaz 66',
            b: 'Rozkaz 57',
            c: 'Rozkaz 96',
            d: 'Rozkaz 47'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'star-wars-w-czym',
        question: 'StarWars: W czym mieszkała Rey?',
        answers: {
            a: 'We wraku AT-AT',
            b: 'W namiocie',
            c: 'W domku na pustyni',
            d: 'Była bezdomna'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 10
    },
    {
        uid: 'jak-nazywa-sie-bron',
        question: 'Jak nazywa się broń Jedi?',
        answers: {
            a: 'Miecz świetlny',
            b: 'Miecz laserowy',
            c: 'SPHA',
            d: 'Blaster'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'jak-nazywaja-sie-mysliwce',
        question: 'Jak nazywają się myśliwce Rebeliantów?',
        answers: {
            a: 'X-wing',
            b: 'TIE',
            c: 'T-3C Delta',
            d: 'YT-1300'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'jaka-nazwe-mial-zloty',
        question: 'Jaką nazwę miał złoty robot protokolarny?',
        answers: {
            a: 'C-3PO',
            b: 'R2D2',
            c: 'BB-8',
            d: 'BD-1'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'ktora-z-tych-postaci',
        question: 'Która z tych postaci jest protagonistą serii gier komputerowych "The Elder Scrolls"?',
        answers: {
            a: 'Dovahkiin',
            b: 'Arthas Menethil',
            c: 'Ezio Auditore',
            d: 'Geralt z Rivii'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'jaki-autor-stworzyl-sage',
        question: 'Jaki autor stworzył sagę "Wiedźmin"?',
        answers: {
            a: 'Andrzej Sapkowski',
            b: 'J.R.R. Tolkien',
            c: 'George R.R. Martin',
            d: 'Terry Pratchett'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    },
    {
        uid: 'w-ktorej-serii-ksiazek',
        question: 'W której serii książek możemy spotkać smoka o imieniu Smaug?',
        answers: {
            a: 'Hobbit',
            b: 'Eragorn',
            c: 'Gra o Tron',
            d: 'Harry Potter'
        },
        correct: 'a',
        updatedAt: FieldValue.serverTimestamp(),
        value: 5
    }
];

export default questionsSeed;
