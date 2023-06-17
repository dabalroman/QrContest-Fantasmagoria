import Metatags from '@/components/Metatags';
import CollectCardComponent from '@/components/collect/CollectCardComponent';
import Card from '@/models/Card';
import ScreenTitle from '@/components/ScreenTitle';
import LookForCodeComponent from '@/components/collect/LookForCodeComponent';
import toast from 'react-hot-toast';
import { useState } from 'react';
import useCollectedCards from '@/hooks/useCollectedCards';

export default function CollectPage ({ code = null }: { code?: string | null }) {
    const { setCards } = useCollectedCards();
    const [card, setCard] = useState<Card | null>(null);

    const collectErrorsDictionary: { [key: string]: string } = {
        'card is already collected': 'Zebrałeś już tę kartę!',
        'card code is invalid': 'Ten kod jest niepoprawny!'
    };

    const onCodeValid = (card: Card) => {
        setCard(card);
        setCards(null);
        toast.success('Karta została pomyślnie zebrana!');
    };

    const onCodeInvalid = (error: Error) => {
        toast.error(collectErrorsDictionary[error.message] ?? 'Błąd aplikacji, spróbuj ponownie.');
        console.error(error.message);
    };

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Szukaj"/>
            <ScreenTitle>Szukaj</ScreenTitle>
            {!card && <LookForCodeComponent code={code} onCodeValid={onCodeValid} onCodeInvalid={onCodeInvalid}/>}
            {card && <CollectCardComponent card={card}/>}
        </main>
    );
}
