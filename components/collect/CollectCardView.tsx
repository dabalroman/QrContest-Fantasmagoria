import CardComponent from '@/components/CardComponent';
import Panel from '@/components/Panel';
import Card from '@/models/Card';
import Question from '@/models/Question';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDiceD6, faQuestion } from '@fortawesome/free-solid-svg-icons';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { Page } from '@/Enum/Page';

export default function CollectCardView ({
    card,
    question,
    goToQuestion
}: { card: Card, question?: Question | null, goToQuestion: () => void }) {
    useDynamicNavbar({
        icon: question ? faQuestion : faCheck,
        href: !question ? Page.COLLECTION + `/${card?.uid}` : undefined,
        onClick: question ? goToQuestion : undefined,
        animatePointsAdded: card?.value,
        animate: true,
        disabledSides: question !== null
    });

    return (
        <div className="relative h-full flex flex-col">
            <CardComponent card={card} className="z-50 relative top-3 grow w-full"/>
            <Panel margin={false} className="text-center relative z-0 rounded-2xl">
                <p>Karta została dodana do Twojej kolekcji.</p>
                {question && <p>Zdobądź dodatkowe <FontAwesomeIcon icon={faDiceD6} size="xs"/> Rubiki w wyzwaniu!</p>}
            </Panel>
        </div>
    );
}
