import FantasmagoriaProgramEntry from '@/models/FantasmagoriaProgramEntry';
import { getTimeHourAndMinutes } from '@/utils/date';

export default function AgendaScreen ({ programEntries }: { programEntries: FantasmagoriaProgramEntry[] }) {
    const getEntriesForNextHours = (
        allEntries: FantasmagoriaProgramEntry[],
        hoursToOffset = 2
    ): FantasmagoriaProgramEntry[] | null => {
        const now = new Date();
        const nextHours = new Date((new Date()).getTime() + hoursToOffset * 60 * 60 * 1000);
        const filteredEntries = allEntries.filter((entry: FantasmagoriaProgramEntry) =>
            entry.dateStart >= now && entry.dateStart <= nextHours
        );

        if (filteredEntries.length === 0) {
            return null;
        }

        return filteredEntries;
    };

    let entriesToDisplay = getEntriesForNextHours(programEntries);

    if (entriesToDisplay === null) {
        entriesToDisplay = getEntriesForNextHours(programEntries, 24);
    }

    entriesToDisplay = entriesToDisplay?.slice(0, 12) ?? null;

    return (
        <div>
            <div style={{
                position: 'absolute',
                backgroundColor: '#FFF',
                width: '8px',
                height: '100vh',
                left: '122px'
            }}></div>
            <div className="w-full h-full flex flex-col p-20 font-semibold scrolling-container py-80">
                {entriesToDisplay?.map((entry: FantasmagoriaProgramEntry) => (
                    <div key={entry.title} className="flex flex-row pb-20">
                        <div style={{
                            position: 'absolute',
                            backgroundColor: '#FFF',
                            borderRadius: '100%',
                            width: '40px',
                            height: '40px',
                            marginTop: '2.2em',
                            left: '105px'
                        }}></div>

                        <p style={{
                            paddingLeft: '2em',
                            paddingRight: '1em',
                            fontSize: '5em'
                        }}>{getTimeHourAndMinutes(entry.dateStart)}</p>

                        <div>
                            <p style={{
                                fontSize: '5em',
                                filter: 'brightness(1.4)',
                                position: 'relative',
                                width: 'fit-content'
                            }}>{entry.title}</p>
                            <p style={{
                                fontSize: '3em'
                            }}>{entry.location}</p>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .scrolling-container {
                    overflow: hidden;
                    animation: scrollUpDown 120s linear infinite;
                }

                @keyframes scrollUpDown {
                    0% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(calc(-100% + 100vh));
                    }
                    100% {
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
