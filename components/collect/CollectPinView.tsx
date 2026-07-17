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
    goToQuestion,
    onDone
}: { pin: CollectedPin, question?: Question | null, goToQuestion: () => void, onDone?: () => void }) {
    // NavbarSuperButton prefers onClick over href, so /collect (no onDone) links to /map, while the map
    // overlay passes onDone to close in place — a same-route push would not remount and would deadlock.
    useDynamicNavbar({
        icon: question ? faQuestion : faCheck,
        href: !question ? Page.MAP : undefined,
        onClick: question ? goToQuestion : onDone,
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
