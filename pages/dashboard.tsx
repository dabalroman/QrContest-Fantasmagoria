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
    Reminder,
    Agenda
}

const screenTypeWeights = {
    [ScreenType.FantasmagoriaSplash]: 0.07,
    [ScreenType.QrContestSplash]: 0.07,
    [ScreenType.Reminder]: 0.07,
    [ScreenType.Event]: 0.39,
    [ScreenType.Agenda]: 0.40
};

// Event and Agenda render nothing at all without program data, so a failed first fetch would
// leave the kiosk blank 82% of the cycle. Until a fetch succeeds, cycle only the screens that
// need no program.
const programFreeScreenTypeWeights = {
    [ScreenType.FantasmagoriaSplash]: 0.35,
    [ScreenType.QrContestSplash]: 0.45,
    [ScreenType.Reminder]: 0.2
};

const billboards = [
    '/dashboard/mok-parter.webp',
    '/dashboard/mok-piwnica.webp'
];

type Reminder = {
    title: string,
    subtitle: string,
    nightOnly?: boolean
};

/* eslint-disable max-len */
const reminders: Reminder[] = [
    { title: 'Pij wodę!', subtitle: 'Odwodniony bohater to martwy bohater.' },
    { title: 'Pij wodę!', subtitle: 'Na Arrakis za łyk wody ginęli ludzie. Tu masz go za darmo, korzystaj.' },
    { title: 'Pij wodę!', subtitle: 'Herbata się nie liczy. Energetyk tym bardziej.' },
    { title: 'Zjedz coś!', subtitle: 'Głodny bohater podejmuje decyzje, których żałuje cała drużyna.' },
    { title: 'Weź prysznic!', subtitle: 'Yennefer pachniała bzem i agrestem. A Ty? Trudno powiedzieć...' },
    { title: 'Zrób sobie przerwę!', subtitle: 'Nawet smok przerywa, żeby odnowiło mu się zionięcie.' },
    { title: 'Rozprostuj nogi!', subtitle: 'Frodo przeszedł do Mordoru na piechotę. Ty możesz obejść korytarz.' },
    { title: 'Naładuj telefon!', subtitle: 'Skanowanie kodów na jednym procencie to ryzyko, a nie strategia.' },
    { title: 'Idź spać!', subtitle: 'Nieumarli nie śpią i widać po nich, że to zły pomysł.', nightOnly: true }
];
/* eslint-enable max-len */

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

const getFantasmagoriaProgram = async (): Promise<FantasmagoriaProgramEntry[] | null> => {
    try {
        const data = await fetch(
            process.env.NEXT_PUBLIC_DASHBOARD_API_URL ?? '',
            {
                method: 'POST',
                headers: { 'content-type': 'application/json-rpc' },
                body: JSON.stringify({
                    'id': null,
                    'method': 'GetKonwent2026Program'
                })
            }
        )
            .then((response) => response.json());

        if (!Array.isArray(data?.result)) {
            console.error('Fantasmagoria program response has no result array', data);

            return null;
        }

        const blacklist = [
            'Gra Konwentowa',
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
    } catch (error) {
        console.error(error);

        return null;
    }
};

const getRandomScreenType = (hasProgramEntries: boolean) => {
    const weights = hasProgramEntries ? screenTypeWeights : programFreeScreenTypeWeights;

    return parseInt(
        getRandomArrayElementWithWeights(
            Object.keys(weights) as string[],
            Object.values(weights)
        ) as string ?? ScreenType.QrContestSplash
    ) as ScreenType;
};

const getRandomReminder = (): Reminder => {
    const currentHour = new Date().getHours();
    const isDarkAlready = currentHour >= 21 || currentHour < 6;

    return getRandomArrayElement(
        reminders.filter((reminder) => (reminder.nightOnly ?? false) === isDarkAlready)
    ) as Reminder;
};

export default function DashboardPage () {
    const { user } = useUserData();
    const router = useRouter();
    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.Agenda);
    const [programEntries, setProgramEntries] = useState<FantasmagoriaProgramEntry[]>([]);
    const [currentTheme, setCurrentTheme] = useState<string>(colorThemes[0]);
    const [billboard, setBillboard] = useState<string>(billboards[0]);
    const [reminder, setReminder] = useState<Reminder>(reminders[0]);
    const [cycle, setCycle] = useState<number>(0);

    useDynamicNavbar({
        onlyCenter: true
    });

    useEffect(() => {
        if (user && user.role === UserRole.USER) {
            router.push(Page.COLLECT)
                .then();
        }
    }, [router, user]);

    // Drawn here rather than in the JSX: the screen re-renders on the colour transition,
    // which would swap the billboard and the reminder text mid-display. A timeout rather than an
    // interval, so a tap-to-skip restarts the full minute instead of landing next to the old tick.
    useEffect(() => {
        setScreenType(getRandomScreenType(programEntries.length > 0));
        setBillboard(getRandomArrayElement(billboards) as string);
        setReminder(getRandomReminder());
        setCurrentTheme(getRandomArrayElement(colorThemes) as string);

        const timeout = setTimeout(() => setCycle((current) => current + 1), cycleScreenEveryMs);

        return () => clearTimeout(timeout);
    }, [programEntries, cycle]);

    useEffect(() => {
        // A failed refetch keeps the previously fetched program - it changes rarely, and a blank
        // kiosk is worse than a slightly stale one.
        const refreshProgram = async () => {
            const entries = await getFantasmagoriaProgram();

            if (entries) {
                setProgramEntries(entries);
            }
        };

        refreshProgram()
            .then();

        const fetchTimeout = setInterval(refreshProgram, fetchNewDataEveryMs);

        return () => clearInterval(fetchTimeout);
    }, []);

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen z-50 bg-center bg-cover bg-fixed bg-no-repeat"
            style={{ backgroundImage: `url(/backgrounds/bg-dashboard.webp)` }}
            onClick={() => setCycle((current) => current + 1)}
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

                {screenType === ScreenType.QrContestSplash &&
                   <div
                       className="w-full h-full fill bg-center bg-contain bg-no-repeat"
                       style={{
                           'backgroundImage': `url(${billboard})`
                       }}
                   ></div>
                }

                {screenType === ScreenType.Reminder &&
                  <div className="w-full h-full flex flex-col justify-center p-20 font-semibold text-center">
                    <p style={{
                        padding: '0.3em 0',
                        fontSize: '7em',
                        filter: 'brightness(1.4)',
                        marginBottom: '2rem',
                        fontWeight: '800'
                    }}>{reminder.title}</p>
                    <p style={{
                        fontSize: '3em',
                        filter: 'brightness(1.2)'
                    }}>{reminder.subtitle}</p>
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
