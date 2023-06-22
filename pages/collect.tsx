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
import { Page } from '@/Enum/Page';

enum CollectPageState {
    LOOK_FOR_CODE,
    CARD_FOUND,
    CARD_FOUND_WITH_QUESTION,
    QUESTION,
    QUESTION_ANSWERED
}

const collectErrorsDictionary: StringMap = {
    'card is already collected': 'Masz już tę kartę!',
    'card code is invalid': 'Ten kod jest niepoprawny!'
};

export default function CollectPage () {
    const { setCards } = useCollectedCards();
    const [state, setState] = useState<CollectPageState>(CollectPageState.LOOK_FOR_CODE);
    const [card, setCard] = useState<Card | null>(null);
    const [question, setQuestion] = useState<Question | null>(null);

    const stateToNavbarConfigMap = {
        [CollectPageState.LOOK_FOR_CODE]: {
            icon: faMagnifyingGlass,
            animate: false
        },
        [CollectPageState.CARD_FOUND]: {
            icon: faCheck,
            href: Page.COLLECTION + `#${card?.uid}`,
            animate: false
        },
        [CollectPageState.CARD_FOUND_WITH_QUESTION]: {
            icon: faQuestion,
            onClick: () => setState(CollectPageState.QUESTION),
            animate: true
        },
        [CollectPageState.QUESTION]: {
            icon: faQuestion,
            disabled: true,
            animate: false
        },
        [CollectPageState.QUESTION_ANSWERED]: {
            icon: faCheck,
            href: Page.COLLECTION + `#${card?.uid}`,
            animate: true
        }
    };

    useDynamicNavbar(stateToNavbarConfigMap[state]);

    const router = useRouter();
    let { code } = router.query as { code: string | string[] | undefined | null };

    if (typeof code !== 'string') {
        code = null;
    }

    const onCodeValid = (card: Card, question: Question | null) => {
        setState(question ? CollectPageState.CARD_FOUND_WITH_QUESTION : CollectPageState.CARD_FOUND);
        setCard(card);
        setQuestion(question);
        setCards(null);
        toast.success('Karta została dodana do kolekcji!');
    };

    const onCodeInvalid = (error: Error) => {
        setState(CollectPageState.LOOK_FOR_CODE);
        toast.error(collectErrorsDictionary[error.message] ?? 'Błąd aplikacji, spróbuj ponownie.');
        console.error(error.message);
    };

    const onAnswerValid = (correct: boolean) => {
        setState(CollectPageState.QUESTION_ANSWERED);

        if (correct) {
            toast.success('Poprawna odpowiedź!');
        } else {
            toast.error('Błędna odpowiedź!');
        }
    };

    const onAnswerInvalid = (error: Error) => {
        setState(CollectPageState.LOOK_FOR_CODE);
        toast.error(collectErrorsDictionary[error.message] ?? 'Błąd aplikacji, spróbuj ponownie.');
        console.error(error.message);
    };

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Szukaj"/>
            <ScreenTitle>Szukaj</ScreenTitle>

            {state === CollectPageState.LOOK_FOR_CODE &&
                <LookForCodeView
                    code={code}
                    onCodeValid={onCodeValid}
                    onCodeInvalid={onCodeInvalid}
                />
            }
            {(state === CollectPageState.CARD_FOUND || state === CollectPageState.CARD_FOUND_WITH_QUESTION)
                && card &&
                <CollectCardView card={card}/>
            }
            {(state === CollectPageState.QUESTION || state === CollectPageState.QUESTION_ANSWERED)
                && card && question &&
                <QuestionCardView
                    card={card}
                    question={question}
                    onAnswerValid={onAnswerValid}
                    onAnswerInvalid={onAnswerInvalid}
                />
            }
        </main>
    );
}
