import CardComponent from '@/components/CardComponent';
import Panel from '@/components/Panel';
import Card from '@/models/Card';
import { formatTimeFromNow } from '@/utils/date';

export default function CollectionCardComponent ({ card }: { card: Card }) {
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
