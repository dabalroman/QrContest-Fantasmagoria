import ScreenTitle from '@/components/ScreenTitle';
import { collection, onSnapshot, orderBy, query } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import { useContext, useEffect, useState } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import Card from '@/models/Card';
import Loader from '@/components/Loader';
import CardsGroupComponent from '@/components/collection/CardsGroupComponent';
import Metatags from '@/components/Metatags';

export default function CollectionPage ({}) {
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

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Kolekcja"/>
            <ScreenTitle>Kolekcja</ScreenTitle>
            <div>
                {loading && <Loader/>}
                {!loading &&
                    <CardsGroupComponent
                        title="Mistyczne stworzenia"
                        description={'Te niezwykłe istoty, posiadające nadprzyrodzone moce i umiejętności,'
                            + ' były mi znane tylko z opowieści i legend, ale teraz mam je przed sobą.'}
                        cards={cards}
                    />
                }
            </div>
        </main>
    );
}
