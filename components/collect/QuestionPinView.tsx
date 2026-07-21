import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import Button, { ButtonState } from '@/components/Button';
import { faCheck, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { answerQuestionFunction } from '@/utils/functions';
import { QuestionAnswerValue } from '@/functions/src/types/question';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { Page } from '@/Enum/Page';
import Panel from '@/components/Panel';
import PinIdentityStrip from '@/components/pin/PinIdentityStrip';
import scheduleAchievementToasts from '@/utils/scheduleAchievementToasts';

export default function QuestionPinView ({
    pin,
    question,
    onAnswer,
    onError,
    onDone
}: {
    pin: CollectedPin,
    question: Question,
    onAnswer: (correct: boolean) => void,
    onError: (error: Error) => void,
    onDone?: () => void
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedAnswer, setSelectedAnswer] = useState<QuestionAnswerValue | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<QuestionAnswerValue | null>(null);

    // href for /collect; onDone (preferred) closes the map overlay in place. Center stays disabled
    // until answered, so onDone only ever fires post-answer.
    useDynamicNavbar({
        icon: correctAnswer ? faCheck : faQuestion,
        href: Page.MAP,
        onClick: onDone,
        disabledCenter: !correctAnswer,
        disabledSides: !correctAnswer,
        animate: correctAnswer !== null,
        animatePointsAdded: selectedAnswer === correctAnswer ? question.value : undefined
    });

    const [scrambledAnswers] = useState<string[][]>(
        Object.entries(question.answers)
            .sort(() => (Math.random() > 0.5 ? 1 : -1))
    );

    const answerQuestion = (userAnswer: QuestionAnswerValue) => {
        if (selectedAnswer !== null) {
            return;
        }

        setLoading(true);
        setSelectedAnswer(userAnswer);

        answerQuestionFunction({
            uid: question.uid,
            answer: userAnswer as string
        })
            .then((result) => {
                setLoading(false);
                scheduleAchievementToasts(result.data.achievements);
                setCorrectAnswer(result.data.correctAnswer);
                onAnswer(result.data.correct);
            })
            .catch((error) => {
                setLoading(false);
                onError(error);
            });
    };

    return (
        <div className="relative h-full flex flex-col">
            <PinIdentityStrip pin={{ ...pin, value: question.value }} className="mt-4"/>
            <Panel loading={loading}>
                <p className="text-center text-xl mb-8">
                    {question.question}
                </p>

                {scrambledAnswers.map(([answerKey, answerText]: string[]) => {
                    let buttonState = loading ? ButtonState.DISABLED : ButtonState.ENABLED;

                    if (answerKey == selectedAnswer) {
                        if (correctAnswer === null) {
                            buttonState = ButtonState.PENDING;
                        } else {
                            if (answerKey !== correctAnswer) {
                                buttonState = ButtonState.INCORRECT;
                            } else {
                                buttonState = ButtonState.CORRECT;
                            }
                        }
                    }

                    if (answerKey == correctAnswer) {
                        buttonState = ButtonState.CORRECT;
                    }

                    return (
                        <Button
                            key={answerKey}
                            className={`w-full mt-4 text-xl`}
                            onClick={() => answerQuestion(answerKey as QuestionAnswerValue)}
                            state={buttonState}
                            style={{
                                'filter':
                                    (!selectedAnswer || answerKey === selectedAnswer
                                        ? 'contrast(1)'
                                        : 'contrast(0.8)'),
                                'transform':
                                    (!selectedAnswer || answerKey === selectedAnswer ? 'scale(1)' : 'scale(0.9)')
                            }}
                        >
                            {answerText}
                        </Button>
                    );
                })}
            </Panel>
        </div>
    );
}
