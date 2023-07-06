import CardComponent from '@/components/CardComponent';
import Panel from '@/components/Panel';
import Card from '@/models/Card';
import Question from '@/models/Question';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';

export default function CollectCardView ({ card, question }: { card: Card, question?: Question | null }) {
    return (
        <div className="relative h-full flex flex-col">
            <CardComponent card={card} className="z-50 relative top-3 grow w-full"/>
            <Panel margin={false} className="text-center pt-10 relative bottom-3 z-0 rounded-b-2xl">
                <p>Karta została dodana do Twojej kolekcji.</p>
                {question && <p>Zdobądź dodatkowe  <FontAwesomeIcon icon={faDiceD6} size="xs"/> Rubiki w wyzwaniu!</p>}
            </Panel>
        </div>
    );
}
