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
                'method': 'GetKonwent2024Program'
            })
        }
    )
        .then((response) => response.json());

    const blacklist = [
        'QrContest',
        'Przygotowanie Cosplay'
    ];

    const now = new Date();
    return data.result
        .map((raw: RawFantasmagoriaProgramEntry) => FantasmagoriaProgramEntry.fromRaw(raw))
        .filter((entry: FantasmagoriaProgramEntry) => entry.dateEnd >= now)
        .filter((entry: FantasmagoriaProgramEntry) => blacklist.every((word: string) => !entry.title.includes(word)))
        .map((entry: FantasmagoriaProgramEntry) => {
            const description = entry.description;
            const cutIndex = description.indexOf(' ', 400);

            if (cutIndex !== -1) {
                entry.description = description.slice(0, cutIndex) + '...';
            }

            return entry;
        })
        .filter((entry: FantasmagoriaProgramEntry) => entry.title.length <= 60)
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
    const showRandom = Math.random() <= 0.3;

    if (showRandom) {
        return getRandomNextEntry(allEntries);
    }

    const next = getRandomNextHoursEntry(allEntries);

    if (!next) {
        return getRandomNextEntry(allEntries);
    }

    return next;
};

const formatDateFromTo = (dateFrom: Date): string => {
    let dateText = formatTime(dateFrom);

    if (dateFrom.getDate() !== (new Date()).getDate()) {
        dateText += ', ' + dateFrom.toLocaleDateString('pl-PL', { weekday: 'long' });
    }

    return dateText;
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
    'rgba(16, 39, 104, 0.8)',
    'rgba(2, 60, 73, 0.8)',
    'rgba(20, 29, 54, 0.8)',
    'rgba(54, 20, 53, 0.8)',
    'rgba(44, 41, 67, 0.8)',
    'rgba(54, 20, 24, 0.8)',
    'rgba(20, 54, 40, 0.8)',
    'rgba(0, 48, 28, 0.8)',
    'rgba(23, 23, 23, 0.8)'
];

const getRandomScreenId = () => {
    const rand = Math.random();

    if (rand <= 0.05) {
        return Screens.FantasmagoriaSplash;
    }
    //
    // if (rand <= 0.1) {
    //     return Screens.News;
    // }

    return Screens.Program;
};

export default function DashboardPage () {
    const { user } = useUserData();
    const router = useRouter();
    const [screenId, setScreenId] = useState<Screens>(Screens.News);
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
        }, 60000);

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
            className="fixed top-0 left-0 w-screen h-screen z-50 bg-center bg-cover bg-fixed bg-no-repeat"
            style={{ backgroundImage: `url(/backgrounds/bg.webp)` }}
        >
            <div
                className={'h-full w-full z-50 text-white font-montserrat'
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

                {screenId === Screens.News &&
                    <div className="w-full h-full flex flex-col justify-center p-20 font-semibold text-center">
                        <p style={{
                            padding: '0.3em 0',
                            fontSize: '7em',
                            filter: 'brightness(1.4)',
                            position: 'relative',
                            paddingLeft: '5rem',
                            left: '-5rem',
                            marginBottom: '2rem',
                            fontWeight: '800'
                        }}>Pij wodę!</p>
                    </div>
                }

                {screenId === Screens.Program && currentEntry &&
                    <div className="w-full h-full flex flex-col justify-center p-20 font-semibold">
                        <p style={{
                            fontSize: '6em',
                            marginBottom: '2rem'
                        }}>{formatDateFromTo(currentEntry.dateStart)}</p>

                        <p style={{
                            padding: '0.3em 0',
                            fontSize: '7em',
                            backgroundColor: currentTheme,
                            filter: 'brightness(1.4)',
                            position: 'relative',
                            paddingLeft: '5rem',
                            left: '-5rem',
                            marginBottom: '2rem',
                            fontWeight: '800'
                        }}>{currentEntry.title}</p>

                        <p style={{
                            fontSize: '4.5em',
                            marginBottom: '1rem'
                        }}>{currentEntry.location}</p>

                        <p style={{
                            paddingBottom: '0',
                            fontSize: '2.5em',
                            marginBottom: '2rem'
                        }}>{currentEntry.description}</p>
                    </div>
                }

                <button
                    className="fixed bottom-0 right-0 h-32 w-32"
                    onClick={() => iterateFontSize()}
                ></button>
            </div>
        </div>
    );
};
