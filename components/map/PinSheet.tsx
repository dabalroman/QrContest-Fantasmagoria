import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { faArrowLeft, faCamera, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Pin from '@/models/Pin';
import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import { PinType } from '@/Enum/PinType';
import { collectPinFunction } from '@/utils/functions';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import PinCardComponent from '@/components/pin/PinCardComponent';
import PhotoPinCollect, { PhotoPinCollectHandle } from '@/components/pin/PhotoPinCollect';
import Panel from '@/components/Panel';
import scheduleAchievementToasts from '@/utils/scheduleAchievementToasts';

// The marker-click sheet. Reuses the SAME card the collect screen shows (decision 18) — Pin satisfies
// PinCardData structurally, so it passes straight in. The collect control is react-hook-form, NOT
// useState: useDynamicNavbar captures onClick once and excludes it from deps, so a useState value
// would submit stale; RHF's handleSubmit reads a ref-backed store, so the stale closure is harmless.
export default function PinSheet ({
    pin,
    collected,
    collectedPin,
    onClose,
    onCollected,
    onError
}: {
    pin: Pin,
    collected: boolean,
    // The player's own collectedPins snapshot for this pin (present iff `collected`). Its
    // awardedPoints distinguishes a pending photo (0) from an approved one (> 0) with no extra read.
    collectedPin?: CollectedPin | null,
    onClose: () => void,
    onCollected: (collectedPin: CollectedPin, question: Question | null) => void,
    onError: (error: Error) => void
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const { register, handleSubmit } = useForm({ mode: 'onChange', defaultValues: { answer: '' } });
    const photoCollectRef = useRef<PhotoPinCollectHandle>(null);

    const needsAnswer = pin.type === PinType.CODE || pin.type === PinType.RIDDLE;
    const isPhoto = pin.type === PinType.PHOTO;
    // Photo pins have their own in-panel capture flow; feedback (#12) is still unimplemented.
    const notSupported = pin.type === PinType.FEEDBACK;
    // The navbar centre collect button covers code/riddle/visit only — photo submits via its own panel.
    const canCollect = !collected && !notSupported && !isPhoto;
    // A photo pin with no image sent yet: the centre button becomes the uploader.
    const canUploadPhoto = isPhoto && !collected;
    const photoApproved = isPhoto && collected && (collectedPin?.awardedPoints ?? 0) > 0;
    const photoPending = isPhoto && collected && !photoApproved;

    const collect = (data: { answer: string }) => {
        setLoading(true);

        collectPinFunction(needsAnswer
            ? { pinUid: pin.uid, answer: data.answer }
            : { pinUid: pin.uid }
        )
            .then((result) => {
                setLoading(false);
                scheduleAchievementToasts(result.data.achievements);
                onCollected(
                    CollectedPin.fromRaw(result.data.pin),
                    result.data.question ? Question.fromRaw(result.data.question) : null
                );
            })
            .catch((error) => {
                setLoading(false);
                onError(error);
            });
    };

    // The centre super-button is always actionable now: collect (check) when collectable, open the photo
    // picker (camera) for an un-submitted photo pin, otherwise back (arrow) to close the drawer. Distinct
    // icons matter — useDynamicNavbar re-runs (and re-captures onClick) only when `icon` changes.
    const centerIcon = canCollect ? faCheck : canUploadPhoto ? faCamera : faArrowLeft;
    const centerOnClick = canCollect
        ? handleSubmit(collect)
        : canUploadPhoto
            ? () => photoCollectRef.current?.openPicker()
            : onClose;

    useDynamicNavbar({
        icon: centerIcon,
        onClick: centerOnClick,
        disabledSides: true,
        animate: canCollect
    });

    return (
        <>
            <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose}/>
            <div
                className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-3xl
                    bg-background p-4 pb-32 shadow-panel"
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 text-text-accent"
                    aria-label="Zamknij"
                >
                    <FontAwesomeIcon icon={faXmark} size="2x"/>
                </button>

                <PinCardComponent pin={pin} className="w-44 mx-auto"/>

                <Panel className="text-justify mt-4">
                    <p className="whitespace-pre-line text-center font-semibold">{pin.description}</p>
                </Panel>

                {pin.clue &&
                    <Panel title="Wskazówka" className="text-justify">
                        <p className="whitespace-pre-line">{pin.clue}</p>
                    </Panel>
                }

                {canCollect && needsAnswer &&
                    <Panel title={pin.type === PinType.CODE ? 'Wpisz kod' : 'Rozwiąż zagadkę'} loading={loading}>
                        <form onSubmit={handleSubmit(collect)}>
                            <input
                                type="text"
                                placeholder={pin.type === PinType.CODE ? 'ABCDEFGHIJ' : 'Twoja odpowiedź'}
                                className="rounded-xl block w-full p-1 border-2 border-input-border text-center
                                    bg-input-background text-text-accent uppercase text-2xl shadow-inner-input
                                    tracking-wider font-semibold"
                                {...register('answer', { setValueAs: (value: string) => value.trim() })}
                            />
                            <p className="text-center pt-2">Kliknij przycisk, by potwierdzić.</p>
                        </form>
                    </Panel>
                }

                {canCollect && !needsAnswer &&
                    <Panel loading={loading}>
                        <p className="text-center font-semibold">Jesteś na miejscu? Kliknij przycisk, by zaliczyć.</p>
                    </Panel>
                }

                {isPhoto && !collected &&
                    <PhotoPinCollect ref={photoCollectRef} pinUid={pin.uid} onSubmitted={() => undefined}/>
                }

                {photoPending &&
                    <Panel>
                        <p className="text-center font-semibold">
                            Zdjęcie wysłane — oczekuje na weryfikację. Punkty zostaną dodane po zaakceptowaniu zdjęcia.
                        </p>
                    </Panel>
                }

                {photoApproved &&
                    <Panel>
                        <p className="text-center font-semibold">Zdjęcie zaakceptowane!</p>
                    </Panel>
                }

                {notSupported &&
                    <Panel>
                        <p className="text-center font-semibold">Wkrótce</p>
                    </Panel>
                }

                {collected && !isPhoto &&
                    <Panel>
                        <p className="text-center font-semibold">To miejsce masz już odwiedzone!</p>
                    </Panel>
                }
            </div>
        </>
    );
}
