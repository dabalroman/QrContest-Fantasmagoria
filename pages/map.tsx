import { useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import Metatags from '@/components/Metatags';
import Loader from '@/components/Loader';
import ScreenTitle from '@/components/ScreenTitle';
import MapAreaToggle from '@/components/map/MapAreaToggle';
import PinSheet from '@/components/map/PinSheet';
import CollectPinView from '@/components/collect/CollectPinView';
import QuestionPinView from '@/components/collect/QuestionPinView';
import Pin from '@/models/Pin';
import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import { PinsCacheContext, PinsCacheContextType } from '@/utils/context';
import { defaultMapId } from '@/utils/maps';
import { getCollectErrorMessage } from '@/utils/collectErrors';

// Leaflet touches window at module scope and /map prerenders at build → client-only.
const MapCanvas = dynamic(() => import('@/components/map/MapCanvas'), {
    ssr: false,
    loading: () => <Loader/>
});

enum MapOverlayState {
    NONE,
    PIN_FOUND,
    PIN_FOUND_WITH_QUESTION,
    QUESTION,
    QUESTION_ANSWERED_OK,
    QUESTION_ANSWERED_MISTAKE
}

// The availability window is filtered client-side by clock (the getPins override): a time-limited pin
// opens with no document write, so a server-side filter on a polled feed would leave it invisible until
// the next poll. collectPinHandle still enforces the window server-side — this is purely cosmetic.
function isPinVisibleNow (pin: Pin): boolean {
    const now = Date.now();
    if (pin.availableFrom && pin.availableFrom.getTime() > now) {
        return false;
    }
    if (pin.availableTo && pin.availableTo.getTime() < now) {
        return false;
    }
    return true;
}

export default function MapPage () {
    const { pins, collectedPins } = useContext<PinsCacheContextType>(PinsCacheContext);

    const [activeMapId, setActiveMapId] = useState<string>(defaultMapId);
    const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
    const [overlayState, setOverlayState] = useState<MapOverlayState>(MapOverlayState.NONE);
    const [collectedPin, setCollectedPin] = useState<CollectedPin | null>(null);
    const [question, setQuestion] = useState<Question | null>(null);

    const visiblePins = useMemo(
        () => (pins?.get() ?? []).filter(isPinVisibleNow),
        [pins]
    );
    const collectedUids = useMemo(
        () => new Set((collectedPins?.get() ?? []).map((pin) => pin.uid)),
        [collectedPins]
    );

    const onPinCollected = (collected: CollectedPin, drawnQuestion: Question | null) => {
        setSelectedPin(null);
        setCollectedPin(collected);
        setQuestion(drawnQuestion);

        if (drawnQuestion) {
            toast('To miejsce kryje pytanie!', { icon: '🎲' });
            setOverlayState(MapOverlayState.PIN_FOUND_WITH_QUESTION);
        } else {
            toast.success('Miejsce zaliczone!');
            setOverlayState(MapOverlayState.PIN_FOUND);
        }
    };

    const onCollectError = (error: Error) => {
        toast.error(getCollectErrorMessage(error));
        console.error(error.message);
    };

    const backToMap = () => {
        setOverlayState(MapOverlayState.NONE);
        setCollectedPin(null);
        setQuestion(null);
    };

    const onQuestionAnswer = (correct: boolean) => {
        if (correct) {
            setOverlayState(MapOverlayState.QUESTION_ANSWERED_OK);
            toast.success('Poprawna odpowiedź!');
        } else {
            setOverlayState(MapOverlayState.QUESTION_ANSWERED_MISTAKE);
            toast.error('Błędna odpowiedź!');
        }
    };

    const showCollectOverlay = overlayState === MapOverlayState.PIN_FOUND
        || overlayState === MapOverlayState.PIN_FOUND_WITH_QUESTION;
    const showQuestionOverlay = overlayState === MapOverlayState.QUESTION
        || overlayState === MapOverlayState.QUESTION_ANSWERED_OK
        || overlayState === MapOverlayState.QUESTION_ANSWERED_MISTAKE;

    return (
        <main className="grid grid-rows-layout h-dvh overflow-hidden">
            <Metatags title="Mapa"/>

            <MapAreaToggle activeMapId={activeMapId} onSelect={setActiveMapId}/>

            {/* z-0 makes a stacking context so Leaflet's internal z-indices never paint over the navbar. */}
            <div className="relative overflow-hidden z-0">
                <MapCanvas
                    pins={visiblePins}
                    activeMapId={activeMapId}
                    collectedUids={collectedUids}
                    onPinClick={setSelectedPin}
                />
            </div>

            {selectedPin && overlayState === MapOverlayState.NONE &&
                <PinSheet
                    pin={selectedPin}
                    collected={collectedUids.has(selectedPin.uid)}
                    onClose={() => setSelectedPin(null)}
                    onCollected={onPinCollected}
                    onError={onCollectError}
                />
            }

            {/* Collect result overlays the still-mounted map (never unmount MapCanvas — it would reset pan/zoom). */}
            {showCollectOverlay && collectedPin &&
                <div className="fixed inset-0 z-40 grid grid-rows-layout items-center min-h-screen p-4
                    bg-image-default bg-cover bg-center bg-fixed">
                    <ScreenTitle>Miejsce</ScreenTitle>
                    <CollectPinView
                        pin={collectedPin}
                        question={question}
                        goToQuestion={() => setOverlayState(MapOverlayState.QUESTION)}
                        onDone={backToMap}
                    />
                </div>
            }

            {showQuestionOverlay && collectedPin && question &&
                <div className="fixed inset-0 z-40 grid grid-rows-layout items-center min-h-screen p-4
                    bg-image-default bg-cover bg-center bg-fixed">
                    <ScreenTitle>Pytanie</ScreenTitle>
                    <QuestionPinView
                        pin={collectedPin}
                        question={question}
                        onAnswer={onQuestionAnswer}
                        onError={onCollectError}
                        onDone={backToMap}
                    />
                </div>
            }
        </main>
    );
}
