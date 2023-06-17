import ScreenTitle from '@/components/ScreenTitle';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import CardsSetComponent from '@/components/collection/CardsSetComponent';
import Metatags from '@/components/Metatags';
import useCollectedCards from '@/hooks/useCollectedCards';
import CardSet from '@/models/CardSet';

export default function CollectionPage ({}) {
    const {
        cards,
        cardSets
    } = useCollectedCards();
    const [loading, setLoading] = useState<boolean>(!cards);

    useEffect(() => {
        setLoading(!cards);
    }, [cards]);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Kolekcja"/>
            <ScreenTitle>Kolekcja</ScreenTitle>
            <div>
                {loading && <Loader/>}
                {!loading && cards && cardSets &&
                    cardSets.get()
                        .map((cardSet: CardSet) =>
                            <CardsSetComponent
                                key={cardSet.uid}
                                cardSet={cardSet}
                                cards={cards.get()}
                            />
                        )
                }
            </div>
        </main>
    );
}
