import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { useEffect, useState } from 'react';
import useUserData from '@/hooks/useUserData';
import { UserRole } from '@/Enum/UserRole';
import { Page } from '@/Enum/Page';
import { useRouter } from 'next/router';
import FantasmagoriaProgramEntry, { RawFantasmagoriaProgramEntry } from '@/models/FantasmagoriaProgramEntry';
import getRandomArrayElement from '@/utils/randomArrayElement';
import toast from 'react-hot-toast';

enum Screens {
    FantasmagoriaSplash,
    Program,
    News,
}

const getFantasmagoriaProgram = async (): Promise<FantasmagoriaProgramEntry[]> => {
    const data = await fetch(
        'https://fantasmagoria.gniezno.pl/api/json-rpc/',
        {
            method: 'POST',
            headers: { 'content-type': 'application/json-rpc' },
            body: JSON.stringify({
                'id': null,
                'method': 'GetKonwent2023Program'
            })
        }
    )
        .then((response) => response.json());

    const now = new Date();
    return data.result
        .map((raw: RawFantasmagoriaProgramEntry) => FantasmagoriaProgramEntry.fromRaw(raw))
        .filter((entry: FantasmagoriaProgramEntry) => entry.dateEnd >= now)
        .sort((a: FantasmagoriaProgramEntry, b: FantasmagoriaProgramEntry) =>
            a.dateStart > b.dateStart ? 1 : (a.dateStart < b.dateStart ? -1 : 0)
        );
};

const getRandomNextEntry = (allEntries: FantasmagoriaProgramEntry[]): FantasmagoriaProgramEntry | null => {
    const now = new Date();
    const filteredEntries = allEntries.filter((entry: FantasmagoriaProgramEntry) => entry.dateEnd >= now);

    return getRandomArrayElement(filteredEntries);
};

const getRandomNextHoursEntry = (
    allEntries: FantasmagoriaProgramEntry[],
    hoursToOffset = 2
): FantasmagoriaProgramEntry | null => {
    const now = new Date();
    const nextHours = new Date((new Date()).getTime() + hoursToOffset * 60 * 60 * 1000);
    const filteredEntries = allEntries.filter((entry: FantasmagoriaProgramEntry) =>
        entry.dateStart >= now && entry.dateStart <= nextHours
    );

    if (filteredEntries.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * filteredEntries.length);
    return filteredEntries[index];
};

const getNextEntryToShow = (allEntries: FantasmagoriaProgramEntry[]): FantasmagoriaProgramEntry | null => {
    const showRandom = Math.random() <= 0.2;

    if (showRandom) {
        return getRandomNextEntry(allEntries);
    }

    const next = getRandomNextHoursEntry(allEntries);

    if (!next) {
        return getRandomNextEntry(allEntries);
    }

    return next;
};

const formatDateFromTo = (dateFrom: Date, dateTo: Date): string => {
    let dateText = '';

    if (dateFrom.getDate() !== (new Date()).getDate()) {
        dateText += formatDate(dateFrom) + ', ';
    }

    dateText += formatTime(dateFrom) + ' - ' + formatTime(dateTo);

    // if (dateFrom.getDate() === dateTo.getDate()) {
    //
    // } else {
    //     dateText += formatTime(dateFrom) + ' - ' + formatDate(dateTo) + ',  ' + formatTime(dateTo);
    // }

    return dateText;
};

const formatDate = (date: Date): string => {
    const amountOfDaysFromNow = date.getDate() - (new Date()).getDate();

    if (amountOfDaysFromNow === 0) {
        return '';
    }

    if (amountOfDaysFromNow === -1) {
        return 'wczoraj';
    }

    if (amountOfDaysFromNow === -2) {
        return 'przedwczoraj';
    }

    if (amountOfDaysFromNow === 1) {
        return 'jutro';
    }

    if (amountOfDaysFromNow === 2) {
        return 'pojutrze';
    }

    return '';

    // return date.toLocaleDateString('pl-PL');
};

const formatTime = (date: Date): string => {
    return date.toLocaleString(
        'pl-PL',
        {
            timeStyle: 'short',
            hour12: false
        }
    );
};

const colorThemes = [
    '#091a49',
    '#173893',
    '#1d2a4d',
    '#4d1d4c',
    '#5f3a5e',
    '#3f3a5f',
    '#4d1d22',
    '#1d4d39',
    '#004528',
    '#212121'
];

const getRandomScreenId = () => {
    const rand = Math.random();

    if (rand <= 0.1) {
        return Screens.FantasmagoriaSplash;
    }

    // if(rand <= 0.15) {
    //     return Screens.News;
    // }

    return Screens.Program;
};

export default function DashboardPage () {
    const { user } = useUserData();
    const router = useRouter();
    const [screenId, setScreenId] = useState<Screens>(Screens.FantasmagoriaSplash);
    const [programEntries, setProgramEntries] = useState<FantasmagoriaProgramEntry[]>([]);
    const [currentEntry, setCurrentEntry] = useState<FantasmagoriaProgramEntry | null>(null);
    const [currentSize, setCurrentSize] = useState<number>(0.8);
    const [currentTheme, setCurrentTheme] = useState<string>(colorThemes[0]);

    useDynamicNavbar({
        onlyCenter: true
    });

    useEffect(() => {
        if (user && user.role === UserRole.USER) {
            router.push(Page.COLLECT)
                .then();
        }
    }, [router, user]);

    useEffect(() => {
        setCurrentEntry(getNextEntryToShow(programEntries));

        const timeout = setInterval(() => {
            setScreenId(getRandomScreenId());
            setCurrentEntry(getNextEntryToShow(programEntries));
            setCurrentTheme(getRandomArrayElement(colorThemes) as string);
        }, 30000);

        return () => clearInterval(timeout);
    }, [programEntries]);

    useEffect(() => {
        (async () => setProgramEntries(await getFantasmagoriaProgram()))();

        const fetchTimeout = setInterval(async () => {
            setProgramEntries(await getFantasmagoriaProgram());
        }, 5 * 60 * 1000);

        return () => clearInterval(fetchTimeout);
    }, []);

    const iterateFontSize = () => {
        const size = currentSize >= 2 ? 0.1 : Math.floor(((currentSize + 0.1) * 100)) / 100;
        setCurrentSize(size);
        toast.success(`Skala ${Math.floor(size * 100)}%`);
    };

    return (
        <div
            className={'fixed top-0 left-0 w-screen h-screen z-50 text-white font-sans font-bold'
                + ' transition-colors duration-1000'}
            style={{
                fontSize: `${currentSize}em`,
                backgroundColor: currentTheme
            }}
        >
            {screenId === Screens.FantasmagoriaSplash &&
                <div
                    className="w-full h-full fill bg-center bg-cover bg-red-800"
                    style={{
                        'backgroundImage': `url(/dashboard/splash.webp)`
                    }}
                ></div>
            }
            {/* {screenId === Screens.News && */}
            {/*     <div className="w-full h-full flex justify-center items-center"> */}
            {/*         <p style={{ fontSize: '150px' }}>Pij wodę!</p> */}
            {/*     </div> */}
            {/* } */}
            {screenId === Screens.Program && currentEntry &&
                <div className="w-full h-full flex flex-col justify-center p-20">
                    <p style={{
                        fontSize: '1.8em'
                    }}>{currentEntry.name}</p>
                    <p style={{
                        padding: '0.3em 0',
                        fontSize: '4.5em'
                    }}>{currentEntry.title}</p>
                    <p style={{
                        paddingBottom: '0.5em',
                        fontSize: '3em'
                    }}>{formatDateFromTo(currentEntry.dateStart, currentEntry.dateEnd)}, {currentEntry.location}</p>
                    <p style={{
                        paddingBottom: '0',
                        fontSize: '1.8em'
                    }}>{currentEntry.description}</p>
                </div>
            }
            <button
                className="fixed bottom-0 right-0 h-32 w-32"
                onClick={() => iterateFontSize()}
            ></button>
        </div>
    );
};
