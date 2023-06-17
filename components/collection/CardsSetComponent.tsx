import Card from '@/models/Card';
import CardSmallComponent from '@/components/CardSmallComponent';
import Panel from '@/components/Panel';
import Link from 'next/link';
import CardSet from '@/models/CardSet';

export default function CardsSetComponent ({
    cardSet,
    cards
}: { cardSet: CardSet, cards: Card[] }) {
    const cardsInSet = cards.filter((card: Card) => card.cardSet === cardSet.uid);

    return (
        <Panel title={cardSet.name}>
            <p className="text-justify">{cardSet.description}</p>
            <div className="grid grid-cols-small-cards gap-4 justify-items-center py-4">
                {cardsInSet
                    .map((card: Card) => (
                        <Link href={`/collection/${card.uid}`} key={card.uid}>
                            <CardSmallComponent card={card} className="shadow-card"/>
                        </Link>
                    ))
                }
            </div>
            <p className="text-right">Zgromadzono {cardsInSet.length} z {cardSet.amountOfCards} kart</p>
        </Panel>
    );
}
