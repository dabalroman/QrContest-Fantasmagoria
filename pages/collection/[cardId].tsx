import { useEffect, useState } from 'react';
import Card from '@/models/Card';
import Metatags from '@/components/Metatags';
import ScreenTitle from '@/components/ScreenTitle';
import { useRouter } from 'next/router';
import Loader from '@/components/Loader';
import CollectedCardComponent from '@/components/collection/CollectedCardComponent';
import useCollectedCards from '@/hooks/useCollectedCards';

export default function CollectedCardPage () {
    const router = useRouter();
    const { cardId } = router.query;

    const { cards } = useCollectedCards();
    const [loading, setLoading] = useState<boolean>(!cards);

    useEffect(() => {
        setLoading(!cards);
    }, [cards]);

    const card = cards?.get()
        .find((card: Card) => card.uid === cardId) ?? null;

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Kolekcja"/>
            <ScreenTitle>Kolekcja</ScreenTitle>
            {loading && <Loader/>}
            {!loading && card && <CollectedCardComponent card={card}/>}
        </main>
    );
}
