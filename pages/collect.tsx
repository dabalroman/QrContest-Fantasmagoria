import Metatags from '@/components/Metatags';
import CollectedPin from '@/models/CollectedPin';
import ScreenTitle from '@/components/ScreenTitle';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Question from '@/models/Question';
import QuestionPinView from '@/components/collect/QuestionPinView';
import CollectPinView from '@/components/collect/CollectPinView';
import LookForCodeView from '@/components/collect/LookForCodeView';
import { getCollectErrorMessage } from '@/utils/collectErrors';

enum CollectPageState {
    LOOK_FOR_CODE,
    PIN_FOUND,
    PIN_FOUND_WITH_QUESTION,
    QUESTION,
    QUESTION_ANSWERED_OK,
    QUESTION_ANSWERED_MISTAKE
}

export default function CollectPage () {
    const [state, setState] = useState<CollectPageState>(CollectPageState.LOOK_FOR_CODE);
    const [pin, setPin] = useState<CollectedPin | null>(null);
    const [question, setQuestion] = useState<Question | null>(null);

    const router = useRouter();
    let { code } = router.query as { code: string | string[] | undefined | null };

    if (typeof code !== 'string') {
        code = null;
    }

    const onCodeValid = (pin: CollectedPin, question: Question | null) => {
        if (question) {
            toast('To miejsce kryje pytanie!', { icon: '🎲' });
        } else {
            toast.success('Miejsce zaliczone!');
        }

        setState(question ? CollectPageState.PIN_FOUND_WITH_QUESTION : CollectPageState.PIN_FOUND);
        setPin(pin);
        setQuestion(question);
    };

    const onCodeInvalid = (error: Error) => {
        setState(CollectPageState.LOOK_FOR_CODE);
        toast.error(getCollectErrorMessage(error));
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
        toast.error(getCollectErrorMessage(error));
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
            {(state === CollectPageState.PIN_FOUND || state === CollectPageState.PIN_FOUND_WITH_QUESTION)
                && pin &&
                <CollectPinView
                    pin={pin}
                    question={question}
                    goToQuestion={() => setState(CollectPageState.QUESTION)}
                />
            }
            {
                (state === CollectPageState.QUESTION
                    || state === CollectPageState.QUESTION_ANSWERED_OK
                    || state === CollectPageState.QUESTION_ANSWERED_MISTAKE
                )
                && pin && question &&
                <QuestionPinView
                    pin={pin}
                    question={question}
                    onAnswer={onQuestionAnswer}
                    onError={onQuestionError}
                />
            }
        </main>
    );
}
