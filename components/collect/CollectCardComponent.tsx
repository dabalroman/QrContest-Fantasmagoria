import CardComponent from '@/components/CardComponent';
import Panel from '@/components/Panel';
import Card from '@/models/Card';

export default function CollectCardComponent ({ card }: { card: Card }) {
    return (
        <div className="relative h-full flex flex-col">
            <CardComponent card={card} className="z-50 relative top-3 grow w-full"/>
            <Panel margin={false} className="text-center pt-10 relative bottom-3 z-0 rounded-b-2xl">
                <p>Dodano do kolekcji!</p>
            </Panel>
        </div>
    );
}
