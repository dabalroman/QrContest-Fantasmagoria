import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import Button, { ButtonState } from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faStar, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { answerQuestionFunction } from '@/utils/functions';
import { QuestionAnswerValue } from '@/functions/src/types/question';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { Page } from '@/Enum/Page';
import Loader from '@/components/Loader';
import getPinIcon from '@/utils/getPinIcon';
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

    const pinColorScheme = 'pin-' + pin.type;

    return (
        <div className="relative h-full flex flex-col">
            <div
                className={
                    'border-8 rounded-3xl shadow-panel top-3'
                    + ' bg-panel-transparent relative'
                    + ` border-${pinColorScheme}`
                    + ' '
                }
                style={{
                    'minHeight': '200px',
                    'objectFit': 'contain',
                    'overflow': 'scroll',
                    'transformStyle': 'preserve-3d',
                    'transform': 'scale(0.9)',
                    'filter': 'drop-shadow(8px 8px 10px rgba(0,0,0,0.5))'
                }}
            >
                <div className="absolute top-0 left-0" style={{
                    top: '-4px',
                    left: '-4px'
                }}>
                    <div
                        className={
                            'border-4 border-b-8 border-r-8 rounded-xl shadow-card '
                            + 'rounded-tl-3xl rounded-tr-none rounded-bl-none '
                            + 'flex items-center justify-center text-text-light '
                            + `border-${pinColorScheme} bg-${pinColorScheme}`
                        }
                        style={{
                            'height': '8.25rem',
                            'width': '5.5rem'
                        }}
                    >
                        <FontAwesomeIcon icon={getPinIcon(pin.type)} className="w-1/2 h-1/2"/>
                    </div>
                </div>
                <div
                    className={`bg-${pinColorScheme}`
                        + ' text-text-light text-3xl font-semibold p-4 pl-24 flex justify-end'}
                >
                    <span>
                        <FontAwesomeIcon icon={faStar} size="sm"/> {question.value}
                    </span>
                </div>
                <div className="p-4 mt-20">
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
                </div>
                {loading && <Loader/>}
            </div>
        </div>
    );
}
