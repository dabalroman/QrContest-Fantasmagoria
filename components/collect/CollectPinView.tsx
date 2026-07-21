import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import { faCheck, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { Page } from '@/Enum/Page';
import Panel from '@/components/Panel';
import getPinIcon from '@/utils/getPinIcon';

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
        <div className="relative h-full flex flex-col items-center justify-center gap-4">
            <div
                className={
                    'flex h-28 w-28 items-center justify-center rounded-full shadow-panel animate-flash '
                    + `bg-pin-${pin.type} text-text-light`
                }
            >
                <FontAwesomeIcon icon={getPinIcon(pin.type)} className="text-5xl"/>
            </div>
            <p className="text-3xl font-fancy-capitals text-text-accent text-center px-4">{pin.name}</p>
            <Panel className="text-justify w-full">
                <p className="whitespace-pre-line text-center font-semibold">{pin.description}</p>
            </Panel>
        </div>
    );
}
