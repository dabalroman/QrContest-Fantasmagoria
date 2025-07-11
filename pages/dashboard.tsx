import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { useEffect, useState } from 'react';
import useUserData from '@/hooks/useUserData';
import { UserRole } from '@/Enum/UserRole';
import { Page } from '@/Enum/Page';
import { useRouter } from 'next/router';
import FantasmagoriaProgramEntry, { RawFantasmagoriaProgramEntry } from '@/models/FantasmagoriaProgramEntry';
import AgendaScreen from '@/components/dashboard/AgendaScreen';
import EventScreen from '@/components/dashboard/EventScreen';
import { getRandomArrayElement, getRandomArrayElementWithWeights } from '@/utils/randomArrayElement';

const cycleScreenEveryMs = 60 * 1000;
const fetchNewDataEveryMs = 60 * 60 * 1000;

enum ScreenType {
    FantasmagoriaSplash,
    QrContestSplash,
    Event,
    News,
    Agenda
}

const screenTypeWeights = {
    [ScreenType.FantasmagoriaSplash]: 0.05,
    [ScreenType.QrContestSplash]: 0.1,
    [ScreenType.News]: 0.03,
    [ScreenType.Event]: 0.40,
    [ScreenType.Agenda]: 0.42
};

const colorThemes = [
    'rgba(44, 41, 67, 0.8)',
    'rgba(54, 20, 24, 0.8)',
    'rgba(54, 20, 53, 0.8)',
    'rgba(20, 29, 54, 0.8)',
    'rgba(19, 38, 94, 0.8)',
    'rgba(2,  60, 73, 0.8)',
    'rgba(20, 54, 40, 0.8)',
    'rgba(8,  41, 26, 0.8)',
    'rgba(23, 23, 23, 0.8)'
];

const getFantasmagoriaProgram = async (): Promise<FantasmagoriaProgramEntry[]> => {
    const data = await fetch(
        process.env.NEXT_PUBLIC_DASHBOARD_API_URL ?? '',
        {
            method: 'POST',
            headers: { 'content-type': 'application/json-rpc' },
            body: JSON.stringify({
                'id': null,
                'method': 'GetKonwent2025Program'
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
        .filter((entry: FantasmagoriaProgramEntry) => entry.title
            && blacklist.every((word: string) => !entry.title.includes(word)))
        .map((entry: FantasmagoriaProgramEntry) => {

            const description = entry.description;
            const cutIndex = description.indexOf(' ', 400);

            if (cutIndex !== -1) {
                entry.description = description.slice(0, cutIndex) + '...';
            }

            return entry;
        })
        .sort((a: FantasmagoriaProgramEntry, b: FantasmagoriaProgramEntry) =>
            a.title > b.title ? 1 : (a.title < b.title ? -1 : 0)
        )
        .sort((a: FantasmagoriaProgramEntry, b: FantasmagoriaProgramEntry) =>
            a.dateStart > b.dateStart ? 1 : (a.dateStart < b.dateStart ? -1 : 0)
        );
};

const getRandomScreenType = () => {
    return parseInt(
        getRandomArrayElementWithWeights(
            Object.keys(screenTypeWeights) as string[],
            Object.values(screenTypeWeights)
        ) as string ?? ScreenType.Event
    ) as ScreenType;
};

export default function DashboardPage () {
    const { user } = useUserData();
    const router = useRouter();
    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.Agenda);
    const [programEntries, setProgramEntries] = useState<FantasmagoriaProgramEntry[]>([]);
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
        setScreenType(getRandomScreenType());

        const timeout = setInterval(() => {
            setScreenType(getRandomScreenType());
            setCurrentTheme(getRandomArrayElement(colorThemes) as string);
        }, cycleScreenEveryMs);

        return () => clearInterval(timeout);
    }, [programEntries]);

    useEffect(() => {
        (async () => setProgramEntries(await getFantasmagoriaProgram()))();

        const fetchTimeout = setInterval(async () => {
            setProgramEntries(await getFantasmagoriaProgram());
        }, fetchNewDataEveryMs);

        return () => clearInterval(fetchTimeout);
    }, []);

    const currentHour = new Date().getHours();
    const isDarkAlready = currentHour >= 21 || currentHour < 6;

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen z-50 bg-center bg-cover bg-fixed bg-no-repeat"
            style={{ backgroundImage: `url(/backgrounds/bg-dashboard.webp)` }}
        >
            <div
                className={'h-full w-full z-50 text-white font-base'
                    + ' transition-colors duration-1000'}
                style={{
                    fontSize: `0.8em`,
                    backgroundColor: currentTheme
                }}
            >
                {screenType === ScreenType.FantasmagoriaSplash &&
                   <div
                       className="w-full h-full fill bg-center bg-contain bg-no-repeat"
                       style={{
                           'backgroundImage': `url(/dashboard/splash.webp)`
                       }}
                   ></div>
                }

                {screenType === ScreenType.QrContestSplash && (
                    isDarkAlready ? (
                        <div
                            className="w-full h-full fill bg-center bg-contain bg-no-repeat"
                            style={{
                                'backgroundImage': `url(/dashboard/zaraz-bedzie-ciemno.webp)`
                            }}
                        ></div>
                    ) : (
                        <div
                            className="w-full h-full fill bg-center bg-contain bg-no-repeat"
                            style={{
                                'backgroundImage': `url(/dashboard/qrContest.webp)`
                            }}
                        ></div>
                    )
                )
                }

                {screenType === ScreenType.News &&
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

                {screenType === ScreenType.Event &&
                  <EventScreen programEntries={programEntries} colorTheme={currentTheme}/>
                }


                {screenType === ScreenType.Agenda &&
                  <AgendaScreen programEntries={programEntries}/>
                }
            </div>
        </div>
    );
};
