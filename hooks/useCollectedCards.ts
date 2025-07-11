import { useContext, useEffect } from 'react';
import { CardsCacheContext, CardsCacheContextType, UserContext, UserContextType } from '@/utils/context';
import { collection, getDocs, orderBy, query, QuerySnapshot } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import Card from '@/models/Card';
import CollectionCache from '@/models/CollectionCache';
import CardSet from '@/models/CardSet';
import CardClue from '@/models/CardClue';

export default function useCollectedCards() {
    const { user } = useContext<UserContextType>(UserContext);
    const {
        cards,
        setCards,
        cardSets,
        setCardSets,
        clues,
        setClues
    } = useContext<CardsCacheContextType>(CardsCacheContext);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        if (!cards) {
            const collectedCardsQuery = query(
                collection(firestore, FireDoc.USERS, user?.uid ?? '', FireDoc.USERS__COLLECTED_CARDS),
                orderBy('uid', 'desc')
            )
                .withConverter(Card.getConverter());

            getDocs(collectedCardsQuery).then((querySnapshot: QuerySnapshot) => {
                const cardsDocs = querySnapshot.docs.map((doc: any) => doc.data()) as Card[];
                setCards(new CollectionCache<Card>(cardsDocs));
            });
        }

        if (!cardSets) {
            const cardSetsQuery = query(collection(firestore, FireDoc.CARD_SET))
                .withConverter(CardSet.getConverter());

            getDocs(cardSetsQuery).then((querySnapshot: QuerySnapshot) => {
                const cardSetsDocs = querySnapshot.docs.map((doc: any) => doc.data()) as CardSet[];
                setCardSets(new CollectionCache<CardSet>(cardSetsDocs));
            });
        }

        if (!clues) {
            const cluesQuery = query(collection(firestore, FireDoc.CLUES))
                .withConverter(CardClue.getConverter());

            getDocs(cluesQuery).then((querySnapshot: QuerySnapshot) => {
                const cluesDocs = querySnapshot.docs.map((doc: any) => doc.data()) as CardClue[];
                setClues(new CollectionCache<CardClue>(cluesDocs));
            })
        }
    }, [cards, setCards, cardSets, setCardSets, clues, setClues, user?.uid]);

    return { cards, setCards, cardSets, setCardSets, clues, setClues };
}
