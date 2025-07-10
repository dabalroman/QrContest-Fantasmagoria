import Card from '@/models/Card';
import CardSmallComponent from '@/components/CardSmallComponent';
import Panel from '@/components/Panel';
import Link from 'next/link';
import CardSet from '@/models/CardSet';
import CardSmallHiddenComponent from '@/components/CardSmallHiddenComponent';
import {CardTier} from '@/Enum/CardTier';

export default function CardsSetComponent({
    cardSet,
    cards
}: { cardSet: CardSet, cards: Card[] }) {
    const cardsInSet = cards.filter((card: Card) => card.cardSet === cardSet.uid);

    return (
        <Panel title={cardSet.name} className={'relative'}>
            <div className="absolute -top-6 h-10" id={cardSet.uid}></div>
            <p className="text-justify">{cardSet.description}</p>
            <div className="grid grid-cols-small-cards gap-4 justify-items-center py-4">
                {
                    Object.entries(cardSet.cardTiers)
                        .sort(([tierA, _], [tierB, __]) => (
                            (cardSet as any).cardTiersOrder[tierA] - (cardSet as any).cardTiersOrder[tierB]
                        ))
                        .map(([tier, amount]) => {
                            const collectedCardsWithTier = cardsInSet.filter((card: Card) => card.tier === tier);

                            const collected = collectedCardsWithTier.map((card: Card) => (
                                <Link href={`/collection/${card.uid}`} key={card.uid}>
                                    <CardSmallComponent card={card}/>
                                </Link>
                            ));

                            const notCollected = Array(amount - collectedCardsWithTier.length)
                                .fill(0)
                                .map((_, i) => (
                                    <CardSmallHiddenComponent key={i} cardTier={tier as CardTier}/>
                                ));

                            return collected.concat(notCollected);
                        })
                }
            </div>
            <p className="text-right">Znaleziono {cardsInSet.length} z {cardSet.amountOfCards} kart</p>
        </Panel>
    );
}
