import Card from '@/models/Card';
import Question from '@/models/Question';
import Button, { ButtonState } from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import CardSmallComponent from '@/components/CardSmallComponent';
import { useState } from 'react';
import { answerQuestionFunction } from '@/utils/functions';
import { QuestionAnswerValue } from '@/functions/src/types/question';

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
    const [answer, setAnswer] = useState<QuestionAnswerValue | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<QuestionAnswerValue | null>(null);

    const [scrambledAnswers] = useState<string[][]>(
        Object.entries(question.answers)
            .sort(() => (Math.random() > 0.5 ? 1 : -1))
    );

    const answerQuestion = (selectedAnswer: QuestionAnswerValue) => {
        if (answer !== null) {
            return;
        }

        setLoading(true);
        setAnswer(selectedAnswer);

        answerQuestionFunction({
            uid: question.uid,
            answer: selectedAnswer
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

    console.log(answer, correctAnswer);

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

                    if (answerKey === answer && answerKey !== correctAnswer) {
                        buttonState = ButtonState.INCORRECT;
                    }

                    return (
                        <Button
                            key={answerKey}
                            className={`w-full mt-3`}
                            onClick={() => answerQuestion(answerKey as QuestionAnswerValue)}
                            state={buttonState}
                        >
                            {answerText}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
