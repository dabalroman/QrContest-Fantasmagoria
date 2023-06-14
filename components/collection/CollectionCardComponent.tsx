import CardComponent from '@/components/CardComponent';
import Panel from '@/components/Panel';
import Card from '@/models/Card';

type PluralForm = 'singular' | 'plural' | 'plural2';

export default function CollectionCardComponent ({ card }: { card: Card }) {

    function getPolishPluralForm(n: number): PluralForm {
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;

        if (lastDigit === 1 && lastTwoDigits !== 11) {
            return 'singular';
        } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
            return 'plural';
        } else {
            return 'plural2';
        }
    }

    const formatTimeFromNow = (date: Date) => {
        const now = new Date();
        const minutesAgo = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

        if (minutesAgo <= 1) {
            return 'minutę temu';
        }

        if (minutesAgo < 60) {
            const pluralType = getPolishPluralForm(minutesAgo);
            return `${minutesAgo} ${pluralType === 'plural' ? 'minuty' : 'minut'} temu`;
        }

        const hoursAgo = Math.floor(minutesAgo / 60);

        if (hoursAgo <= 1) {
            return 'godzinę temu';
        }

        if (hoursAgo < 24) {
            const pluralType = getPolishPluralForm(hoursAgo);
            return `${hoursAgo} ${pluralType === 'plural' ? 'godziny' : 'godzin'} temu`;
        }

        const daysAgo = Math.floor(hoursAgo / 24);
        if (daysAgo <= 1) {
            return 'wczoraj';
        }

        return `${daysAgo} dni temu`;
    };

    return (
        <div className="relative h-full flex flex-col">
            <CardComponent card={card} className="z-50 relative top-3 grow w-full"/>
            <Panel margin={false} className="text-justify pt-10 relative bottom-3 z-0 rounded-b-2xl">
                <p>{card.description}</p>
                {card.collectedAt &&
                    <p className="text-right mt-4">Karta zdobyta {formatTimeFromNow(card.collectedAt)}</p>
                }
            </Panel>
        </div>
    );
}
