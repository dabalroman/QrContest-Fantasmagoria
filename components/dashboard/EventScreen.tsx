import FantasmagoriaProgramEntry from '@/models/FantasmagoriaProgramEntry';
import { getHourMinutesAndWeekday } from '@/utils/date';
import { getRandomArrayElement } from '@/utils/randomArrayElement';

export default function EventScreen ({
    programEntries,
    colorTheme
}: { programEntries: FantasmagoriaProgramEntry[], colorTheme: string }) {
    const getRandomNextEntry = (allEntries: FantasmagoriaProgramEntry[]): FantasmagoriaProgramEntry | null => {
        const now = new Date();
        const filteredEntries = allEntries.filter((entry: FantasmagoriaProgramEntry) => entry.dateStart >= now);

        return getRandomArrayElement(filteredEntries);
    };

    const getRandomEntryFromNextHours = (
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

    const getEntryToShow = (allEntries: FantasmagoriaProgramEntry[]): FantasmagoriaProgramEntry | null => {
        if (Math.random() <= 0.3) {
            return getRandomNextEntry(allEntries);
        }

        const next = getRandomEntryFromNextHours(allEntries);

        if (!next) {
            return getRandomNextEntry(allEntries);
        }

        return next;
    };

    const entryToDisplay = getEntryToShow(programEntries);

    if(entryToDisplay === null) {
        return null;
    }

    return (
        <div className="w-full h-full flex flex-col justify-center p-20 font-semibold">
            <p style={{
                fontSize: '6em',
                marginBottom: '2rem'
            }}>{getHourMinutesAndWeekday(entryToDisplay.dateStart)}</p>

            <p style={{
                fontSize: '7em',
                backgroundColor: colorTheme,
                filter: 'brightness(1.4)',
                position: 'relative',
                padding: '1rem 5rem',
                left: '-5rem',
                marginBottom: '2rem',
                fontWeight: '800',
                width: 'fit-content'
            }}>{entryToDisplay.title}</p>

            <p style={{
                fontSize: '4.5em',
                marginBottom: '1rem'
            }}>{entryToDisplay.location}</p>

            <p style={{
                paddingBottom: '0',
                fontSize: '2.5em',
                marginBottom: '2rem'
            }}>{entryToDisplay.description}</p>
        </div>
    );
}
