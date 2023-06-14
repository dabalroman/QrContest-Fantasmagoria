import { useContext, useEffect, useState } from 'react';
import Card from '@/models/Card';
import Metatags from '@/components/Metatags';
import ScreenTitle from '@/components/ScreenTitle';
import { UserContext, UserContextType } from '@/utils/context';
import { collection, onSnapshot, orderBy, query } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import { useRouter } from 'next/router';
import Loader from '@/components/Loader';
import CollectionCardComponent from '@/components/collection/CollectionCardComponent';

export default function CollectedCardPage () {
    const router = useRouter();
    const { cardId } = router.query;

    const { user } = useContext<UserContextType>(UserContext);
    const [loading, setLoading] = useState<boolean>(true);
    const [cards, setCards] = useState<Card[]>([]);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        const collectedCardsQuery = query(
            collection(firestore, FireDoc.USERS, user?.uid ?? '', FireDoc.COLLECTED_CARDS),
            orderBy('collectedAt', 'desc')
        )
            .withConverter(Card.getConverter());

        //TODO: Remove snapshot, one call is enough
        return onSnapshot(collectedCardsQuery, (snapshot) => {
            const cards = snapshot.docs.map((doc) => doc.data()) as Card[];
            setLoading(false);
            setCards(cards);
        });
    }, [user?.uid]);

    const card = cards.find((card: Card) => card.uid === cardId);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Kolekcja"/>
            <ScreenTitle>Kolekcja</ScreenTitle>
            {loading && <Loader/>}
            {!loading && card && <CollectionCardComponent card={card}/>}
        </main>
    );
}
