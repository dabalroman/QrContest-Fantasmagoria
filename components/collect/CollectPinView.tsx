import PinCardComponent from '@/components/pin/PinCardComponent';
import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import { faCheck, faQuestion } from '@fortawesome/free-solid-svg-icons';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { Page } from '@/Enum/Page';
import Panel from '@/components/Panel';

export default function CollectPinView ({
    pin,
    question,
    goToQuestion
}: { pin: CollectedPin, question?: Question | null, goToQuestion: () => void }) {
    useDynamicNavbar({
        icon: question ? faQuestion : faCheck,
        href: !question ? Page.MAIN : undefined,
        onClick: question ? goToQuestion : undefined,
        animatePointsAdded: pin?.awardedPoints,
        animate: true,
        disabledSides: question !== null
    });

    return (
        <div className="relative h-full flex flex-col">
            <PinCardComponent pin={pin} className="z-20 relative top-3 grow w-full"/>
            <Panel margin={false} className="text-justify relative top-6 z-0 rounded-3xl">
                <p className='whitespace-pre-line text-center font-semibold'>{pin.description}</p>
            </Panel>
        </div>
    );
}
