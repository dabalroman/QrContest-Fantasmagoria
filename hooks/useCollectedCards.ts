import { useContext, useEffect } from 'react';
import { CardsCacheContext, CardsCacheContextType, UserContext, UserContextType } from '@/utils/context';
import { collection, getDocs, orderBy, query, QuerySnapshot } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import Card from '@/models/Card';
import CollectionCache from '@/models/CollectionCache';
import CardSet from '@/models/CardSet';

export default function useCollectedCards() {
    const { user } = useContext<UserContextType>(UserContext);
    const {
        cards,
        setCards,
        cardSets,
        setCardSets
    } = useContext<CardsCacheContextType>(CardsCacheContext);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        if (!cards) {
            const collectedCardsQuery = query(
                collection(firestore, FireDoc.USERS, user?.uid ?? '', FireDoc.USERS__COLLECTED_CARDS),
                orderBy('collectedAt', 'desc')
            )
                .withConverter(Card.getConverter());

            getDocs(collectedCardsQuery).then((querySnapshot: QuerySnapshot) => {
                const cardsDocs = querySnapshot.docs.map((doc: any) => doc.data()) as Card[];
                setCards(new CollectionCache<Card>(cardsDocs));
            });

            //TODO: Remove snapshot, one call is enough
            // return onSnapshot(collectedCardsQuery, (snapshot) => {
            //     const cardDocs = snapshot.docs.map((doc) => doc.data()) as Card[];
            //     setLoading(false);
            //     setCardsCache(cardsCache.update(cardDocs));
            // });
        }

        if (!cardSets) {
            const cardSetsQuery = query(collection(firestore, FireDoc.CARD_SET))
                .withConverter(CardSet.getConverter());

            getDocs(cardSetsQuery).then((querySnapshot: QuerySnapshot) => {
                const cardSetsDocs = querySnapshot.docs.map((doc: any) => doc.data()) as CardSet[];
                setCardSets(new CollectionCache<CardSet>(cardSetsDocs));
            });
        }
    }, [cards, setCards, cardSets, setCardSets, user?.uid]);

    return { cards, setCards, cardSets, setCardSets };
}
