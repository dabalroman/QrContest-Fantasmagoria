import Card from '@/models/Card';
import Question from '@/models/Question';
import Button from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import CardSmallComponent from '@/components/CardSmallComponent';
import { useState } from 'react';

export default function QuestionCardView ({
    card,
    question
}: { card: Card, question: Question }) {
    const [scrambledAnswers] = useState<string[][]>(
        Object.entries(question.answers)
            .sort(() => (Math.random() > 0.5 ? 1 : -1))
    );
    const choice = (value: string) => console.log(value);

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
                        <FontAwesomeIcon icon={faDiceD6} size="xs" className="relative top-1"/> {card.value}
                </span>
            </div>
            <div className="p-4 mt-20">
                <p className="text-center mb-8">
                    {question.question}
                </p>

                {scrambledAnswers.map(([value, answer]: string[]) => (
                        <Button key={value} className="w-full mt-3" onClick={() => choice(value)}>{answer}</Button>
                    )
                )}
            </div>
        </div>
    );
}
