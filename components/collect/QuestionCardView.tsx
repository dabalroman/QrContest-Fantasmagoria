import Card from '@/models/Card';
import Question from '@/models/Question';
import Button, { ButtonState } from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDiceD6, faQuestion } from '@fortawesome/free-solid-svg-icons';
import CardSmallComponent from '@/components/CardSmallComponent';
import { useState } from 'react';
import { answerQuestionFunction } from '@/utils/functions';
import { QuestionAnswerValue } from '@/functions/src/types/question';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { Page } from '@/Enum/Page';
import Loader from '@/components/Loader';

export default function QuestionCardView ({
    card,
    question,
    onAnswer,
    onError
}: {
    card: Card,
    question: Question,
    onAnswer: (correct: boolean) => void,
    onError: (error: Error) => void
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedAnswer, setSelectedAnswer] = useState<QuestionAnswerValue | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<QuestionAnswerValue | null>(null);

    useDynamicNavbar({
        icon: correctAnswer ? faCheck : faQuestion,
        href: Page.COLLECTION + `/${card?.uid}`,
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
            answer: userAnswer
        })
            .then((result) => {
                setLoading(false);
                setCorrectAnswer(result.data.correctAnswer);
                onAnswer(result.data.correct);
            })
            .catch((error) => {
                setLoading(false);
                onError(error);
            });
    };

    return (
        <div
            className={
                'border-8 border-card-border rounded-3xl shadow-panel'
                + ' bg-gradient-to-b from-panel-transparent to-panel-transparent-end relative'
                + ' '
            }
        >
            <div className="absolute top-0 left-0" style={{
                top: '-4px',
                left: '-4px'
            }}>
                <CardSmallComponent card={card} className="border-4 rounded-tl-3xl"/>
            </div>
            <div className="bg-card-border text-text-light text-2xl font-fancy p-4 pl-24 flex justify-between">
                <span>Wyzwanie</span>
                <span>
                     <FontAwesomeIcon icon={faDiceD6} size="xs" className="relative top-1"/> {question.value}
                </span>
            </div>
            <div className="p-4 mt-20">
                <p className="text-center mb-8">
                    {question.question}
                </p>

                {scrambledAnswers.map(([answerKey, answerText]: string[]) => {
                    let buttonState = loading ? ButtonState.DISABLED : ButtonState.ENABLED;

                    if (answerKey === correctAnswer) {
                        buttonState = ButtonState.CORRECT;
                    }

                    if (answerKey === selectedAnswer && answerKey !== correctAnswer) {
                        buttonState = ButtonState.INCORRECT;
                    }

                    return (
                        <Button
                            key={answerKey}
                            className={`w-full mt-3`}
                            onClick={() => answerQuestion(answerKey as QuestionAnswerValue)}
                            state={buttonState}
                            style={{
                                'filter':
                                    (!selectedAnswer || answerKey === selectedAnswer ? 'contrast(1)' : 'contrast(0.8)'),
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
    );
}
