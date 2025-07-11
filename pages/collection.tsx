import ScreenTitle from '@/components/ScreenTitle';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import Metatags from '@/components/Metatags';
import useCollectedCards from '@/hooks/useCollectedCards';
import CardSet from '@/models/CardSet';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import Card from '@/models/Card';
import CollectedCardComponent from '@/components/collection/CollectedCardComponent';
import Panel from '@/components/Panel';
import LinkButton from '@/components/LinkButton';
import CardsSetComponent from '@/components/collection/CardsSetComponent';
import { Page } from '@/Enum/Page';

export default function CollectionPage ({}) {
    const {
        cards,
        cardSets,
        clues
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
        href: card ? `${Page.COLLECTION}#${card.cardSet}` : Page.COLLECT,
        icon: card ? faArrowLeft : faMagnifyingGlass
    });

    const empty = (
        <Panel title="Kolekcja jest pusta">
            <p className="my-2">By zebrać kartę, zeskanuj kod QR lub przejdź do ekranu &quot;Szukaj&quot; i tam
                wpisz jej kod.</p>
            <p className="my-2">Skąd wziąć kod? To dobre pytanie.</p>
            <p>Kody zostały ukryte w różnych miejscach w budynku konwentu. Wciel się w rolę poszukiwacza i
                spróbuj
                znaleźć je wszystkie!</p>
            <LinkButton className="mt-4" href={Page.COLLECT}>Szukaj</LinkButton>
        </Panel>
    );

    let cardsToShow = null;

    if (cards && cardSets && clues && cardSets?.get().length !== 0) {
        cardsToShow = cardSets.get()
            .sort((a, b) => a.order - b.order)
            .map((cardSet: CardSet) =>
                <CardsSetComponent
                    key={cardSet.uid}
                    cardSet={cardSet}
                    cards={cards.get()}
                    clues={clues.get()}
                />
            );
    }

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Kolekcja"/>
            <ScreenTitle>Kolekcja</ScreenTitle>
            {loading && <Loader/>}
            {!loading && cards && cardSets && (
                card
                    ? <CollectedCardComponent card={card}/>
                    : <div>{cardsToShow ?? empty}</div>
            )
            }
        </main>
    );
}
