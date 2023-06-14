import Card from '@/models/Card';
import CardSmallComponent from '@/components/CardSmallComponent';
import Panel from '@/components/Panel';
import Link from 'next/link';

export default function CardsGroupComponent ({
    title,
    description,
    cards
}: { title: string, description: string, cards: Card[] }) {
    return (
        <Panel title={title}>
            <p className="text-justify">{description}</p>
            <div className="grid grid-cols-small-cards gap-4 justify-items-center py-4">
                {cards
                    .map((card: Card) => (
                        <Link href={`/collection/${card.uid}`} key={card.uid}>
                            <CardSmallComponent card={card} className="shadow-card"/>
                        </Link>
                    ))
                }
            </div>
            <p className="text-right">Zgromadzono {cards.length} z 6 kart</p>
        </Panel>
    );
}
