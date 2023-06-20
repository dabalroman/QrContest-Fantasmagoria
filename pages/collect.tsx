import Metatags from '@/components/Metatags';
import Card from '@/models/Card';
import ScreenTitle from '@/components/ScreenTitle';
import toast from 'react-hot-toast';
import { useState } from 'react';
import useCollectedCards from '@/hooks/useCollectedCards';
import { useRouter } from 'next/router';
import Question from '@/models/Question';
import { StringMap } from '@/types/global';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faCheck, faMagnifyingGlass, faQuestion } from '@fortawesome/free-solid-svg-icons';
import QuestionCardView from '@/components/collect/QuestionCardView';
import LookForCodeView from '@/components/collect/LookForCodeView';
import CollectCardView from '@/components/collect/CollectCardView';

const collectErrorsDictionary: StringMap = {
    'card is already collected': 'Zebrałeś już tę kartę!',
    'card code is invalid': 'Ten kod jest niepoprawny!'
};

export default function CollectPage () {
    const { setCards } = useCollectedCards();
    const [card, setCard] = useState<Card | null>(null);
    const [question, setQuestion] = useState<Question | null>(null);

    useDynamicNavbar({
        icon: card ? (question ? faQuestion : faCheck) : faMagnifyingGlass
    });

    const router = useRouter();
    let { code } = router.query as { code: string | string[] | undefined | null };

    if (typeof code !== 'string') {
        code = null;
    }

    const onCodeValid = (card: Card, question: Question | null) => {
        setCard(card);
        setQuestion(question);
        setCards(null);
        toast.success('Karta została dodana do kolekcji!');

        if (question) {
            toast.success('Ta karta zawiera wyzwanie!');
        }
    };

    const onCodeInvalid = (error: Error) => {
        toast.error(collectErrorsDictionary[error.message] ?? 'Błąd aplikacji, spróbuj ponownie.');
        console.error(error.message);
    };

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Szukaj"/>
            <ScreenTitle>Szukaj</ScreenTitle>

            {!card &&
                <LookForCodeView code={code} onCodeValid={onCodeValid} onCodeInvalid={onCodeInvalid}/>
            }
            {card && !question && <CollectCardView card={card}/>}
            {card && question && <QuestionCardView card={card} question={question}/>}
        </main>
    );
}
