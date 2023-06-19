import ScreenTitle from '@/components/ScreenTitle';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import CardsSetComponent from '@/components/collection/CardsSetComponent';
import Metatags from '@/components/Metatags';
import useCollectedCards from '@/hooks/useCollectedCards';
import CardSet from '@/models/CardSet';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import Card from '@/models/Card';
import CollectedCardComponent from '@/components/collection/CollectedCardComponent';

export default function CollectionPage ({}) {
    const {
        cards,
        cardSets
    } = useCollectedCards();
    const [loading, setLoading] = useState<boolean>(!cards);

    useEffect(() => {
        setLoading(!cards);
    }, [cards]);

    const router = useRouter();
    let { cardId } = router.query as { cardId: string | string[] | undefined | null };

    if (typeof cardId !== 'string') {
        cardId = null;
    }

    const card = cards?.get()
        .find((card: Card) => card.uid === cardId) ?? null;

    useDynamicNavbar({
        onClick: card ? (() => router.back()) : undefined,
        icon: card ? faArrowLeft : faMagnifyingGlass
    });

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Kolekcja"/>
            <ScreenTitle>Kolekcja</ScreenTitle>
            {loading && <Loader/>}
            {!loading && cards && cardSets && (
                card
                    ? <CollectedCardComponent card={card}/>
                    : <div>
                        {cardSets.get()
                            .map((cardSet: CardSet) =>
                                <CardsSetComponent
                                    key={cardSet.uid}
                                    cardSet={cardSet}
                                    cards={cards.get()}
                                />
                            )
                        }
                    </div>
            )
            }
        </main>
    );
}
