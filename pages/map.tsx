import { useContext, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Metatags from '@/components/Metatags';
import Loader from '@/components/Loader';
import ScreenTitle from '@/components/ScreenTitle';
import MapAreaToggle from '@/components/map/MapAreaToggle';
import PinSheet from '@/components/map/PinSheet';
import AdminMapEditor from '@/components/map/AdminMapEditor';
import CollectPinView from '@/components/collect/CollectPinView';
import QuestionPinView from '@/components/collect/QuestionPinView';
import Pin from '@/models/Pin';
import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import { PinsCacheContext, PinsCacheContextType, UserContext, UserContextType } from '@/utils/context';
import { UserRole } from '@/Enum/UserRole';
import { defaultMapId, getMap } from '@/utils/maps';
import { getStoredLastMapId, saveLastMapId } from '@/utils/mapView';
import { getCollectErrorMessage } from '@/utils/collectErrors';
import { PinType } from '@/Enum/PinType';

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
// the next poll. collectPinHandle still enforces the window server-side - this is purely cosmetic.
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
    const { user } = useContext<UserContextType>(UserContext);
    const isAdmin = user?.role === UserRole.ADMIN;

    const [activeMapId, setActiveMapId] = useState<string>(defaultMapId);
    // Gate the canvas until we've read the stored floor, so it never mounts on Dwór and swaps a frame later.
    const [restored, setRestored] = useState<boolean>(false);
    // Admin-only: swaps the play canvas for the pin editor, sharing the same area/floor picker.
    const [editMode, setEditMode] = useState<boolean>(false);
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
    // uid -> the player's collectedPins snapshot, so the sheet can read awardedPoints (0 = a photo pin
    // still pending review, > 0 = approved) without an extra read.
    const collectedByUid = useMemo(
        () => new Map((collectedPins?.get() ?? []).map((pin) => [pin.uid, pin])),
        [collectedPins]
    );

    // Restore the last floor once, after mount - not in the useState initializer, which would run during
    // SSR and cause a hydration mismatch. An unknown/renamed mapId is ignored (falls back to defaultMapId).
    useEffect(() => {
        const last = getStoredLastMapId();
        if (last && getMap(last)) {
            setActiveMapId(last);
        }
        setRestored(true);
    }, []);

    const onSelectFloor = (mapId: string) => {
        setActiveMapId(mapId);
        saveLastMapId(mapId);
    };

    // Entering edit mode drops any in-progress player collect so the two flows never overlap.
    const toggleEditMode = () => {
        if (!editMode) {
            setSelectedPin(null);
            setOverlayState(MapOverlayState.NONE);
            setCollectedPin(null);
            setQuestion(null);
        }
        setEditMode((value) => !value);
    };

    const onPinCollected = (collected: CollectedPin, drawnQuestion: Question | null) => {
        setSelectedPin(null);
        setCollectedPin(collected);
        setQuestion(drawnQuestion);

        if (drawnQuestion) {
            toast('To miejsce kryje pytanie!', { icon: '🎲' });
            setOverlayState(MapOverlayState.PIN_FOUND_WITH_QUESTION);
        } else {
            toast.success(`Miejsce zaliczone! +${collected.awardedPoints} pkt`, { icon: '⭐' });
            setOverlayState(MapOverlayState.PIN_FOUND);
        }
    };

    const onCollectError = (error: Error, pinType?: PinType) => {
        toast.error(getCollectErrorMessage(error, pinType));
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
        <main className="relative h-dvh overflow-hidden">
            <Metatags title="Mapa"/>

            {/* Map fills the whole area above the navbar; the selector floats over its top edge.
                z-0 makes a stacking context so Leaflet's internal z-indices never paint over the navbar. */}
            <div className="absolute inset-x-0 top-0 bottom-16 overflow-hidden z-0">
                {!restored
                    ? <Loader/>
                    : editMode
                        ? <AdminMapEditor activeMapId={activeMapId}/>
                        : <MapCanvas
                            pins={visiblePins}
                            activeMapId={activeMapId}
                            collectedUids={collectedUids}
                            onPinClick={setSelectedPin}
                        />
                }
            </div>

            <div className="absolute inset-x-0 top-0 z-10">
                <MapAreaToggle
                    activeMapId={activeMapId}
                    onSelect={onSelectFloor}
                    adminToggle={isAdmin &&
                        <button
                            onClick={toggleEditMode}
                            className={'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-panel '
                                + 'transition-colors pointer-events-auto '
                                + (editMode
                                    ? 'bg-button-accent text-text-light'
                                    : 'bg-panel-transparent text-text-accent backdrop-blur-md')}
                        >
                            <FontAwesomeIcon icon={faPenToSquare}/>
                            Edycja
                        </button>
                    }
                />
            </div>

            {!editMode && selectedPin && overlayState === MapOverlayState.NONE &&
                <PinSheet
                    pin={selectedPin}
                    collected={collectedUids.has(selectedPin.uid)}
                    collectedPin={collectedByUid.get(selectedPin.uid) ?? null}
                    onClose={() => setSelectedPin(null)}
                    onCollected={onPinCollected}
                    onError={(error) => onCollectError(error, selectedPin.type)}
                />
            }

            {/* Collect result overlays the still-mounted map (never unmount MapCanvas - it would reset pan/zoom). */}
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
