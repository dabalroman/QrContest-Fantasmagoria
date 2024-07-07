import Metatags from '@/components/Metatags';
import Card from '@/models/Card';
import ScreenTitle from '@/components/ScreenTitle';
import toast from 'react-hot-toast';
import { useState } from 'react';
import useCollectedCards from '@/hooks/useCollectedCards';
import { useRouter } from 'next/router';
import Question from '@/models/Question';
import { StringMap } from '@/types/global';
import QuestionCardView from '@/components/collect/QuestionCardView';
import CollectCardView from '@/components/collect/CollectCardView';
import LookForCodeView from '@/components/collect/LookForCodeView';

enum CollectPageState {
    LOOK_FOR_CODE,
    CARD_FOUND,
    CARD_FOUND_WITH_QUESTION,
    QUESTION,
    QUESTION_ANSWERED_OK,
    QUESTION_ANSWERED_MISTAKE
}

const collectErrorsDictionary: StringMap = {
    'card is already collected': 'Masz już tę kartę!',
    'card code is invalid': 'Ten kod nie jest poprawny!'
};

export default function CollectPage () {
    const { setCards } = useCollectedCards();
    const [state, setState] = useState<CollectPageState>(CollectPageState.LOOK_FOR_CODE);
    const [card, setCard] = useState<Card | null>(null);
    const [question, setQuestion] = useState<Question | null>(null);

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

    const onQuestionAnswer = (correct: boolean) => {
        if (correct) {
            setState(CollectPageState.QUESTION_ANSWERED_OK);
            toast.success('Poprawna odpowiedź!');
        } else {
            setState(CollectPageState.QUESTION_ANSWERED_MISTAKE);
            toast.error('Błędna odpowiedź!');
        }
    };

    const onQuestionError = (error: Error) => {
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
                <CollectCardView
                    card={card}
                    question={question}
                    goToQuestion={() => setState(CollectPageState.QUESTION)}
                />
            }
            {
                (state === CollectPageState.QUESTION
                    || state === CollectPageState.QUESTION_ANSWERED_OK
                    || state === CollectPageState.QUESTION_ANSWERED_MISTAKE
                )
                && card && question &&
                <QuestionCardView
                    card={card}
                    question={question}
                    onAnswer={onQuestionAnswer}
                    onError={onQuestionError}
                />
            }
        </main>
    );
}
