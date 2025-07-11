import CardComponent from '@/components/CardComponent';
import Card from '@/models/Card';
import Question from '@/models/Question';
import { faCheck, faQuestion } from '@fortawesome/free-solid-svg-icons';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { Page } from '@/Enum/Page';
import Panel from '@/components/Panel';

export default function CollectCardView ({
    card,
    question,
    goToQuestion
}: { card: Card, question?: Question | null, goToQuestion: () => void }) {
    useDynamicNavbar({
        icon: question ? faQuestion : faCheck,
        href: !question ? Page.COLLECTION : undefined,
        onClick: question ? goToQuestion : undefined,
        animatePointsAdded: card?.value,
        animate: true,
        disabledSides: question !== null
    });

    return (
        <div className="relative h-full flex flex-col">
            <CardComponent card={card} className="z-20 relative top-3 grow w-full"/>
            <Panel margin={false} className="text-justify relative top-6 z-0 rounded-3xl">
                <p className='whitespace-pre-line text-center font-semibold'>{card.description}</p>
            </Panel>
        </div>
    );
}
