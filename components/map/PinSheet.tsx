import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { faArrowLeft, faCamera, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Pin from '@/models/Pin';
import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import { entersCode, PinType } from '@/Enum/PinType';
import { collectPinFunction } from '@/utils/functions';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import useTypingAnimation from '@/hooks/useTypingAnimation';
import PinIdentityStrip from '@/components/pin/PinIdentityStrip';
import PhotoPinCollect, { PhotoPinCollectHandle } from '@/components/pin/PhotoPinCollect';
import StarRating from '@/components/pin/StarRating';
import SheetSection from '@/components/map/SheetSection';
import CodeScannerOverlay from '@/components/CodeScannerOverlay';
import scheduleAchievementToasts from '@/utils/scheduleAchievementToasts';
import { getMap, MAP_AREA_LABELS } from '@/utils/maps';

// Mirrors collectPinHandle's validateFeedback - the server rejects anything shorter.
const MIN_TALK_NAME_LENGTH = 10;
const MAX_TALK_NAME_LENGTH = 255;
const CODE_LENGTH = 10;

// The marker-click sheet. Reuses the SAME strip the collect screen shows (decision 18) - Pin satisfies
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
    const [scanning, setScanning] = useState<boolean>(false);
    const { register, handleSubmit, setValue, watch } = useForm({
        mode: 'onChange',
        defaultValues: { answer: '', talkName: '', rating: 0 }
    });
    const photoCollectRef = useRef<PhotoPinCollectHandle>(null);
    const typeAnswer = useTypingAnimation((text) => setValue('answer', text, { shouldValidate: true }));

    const needsAnswer = pin.type === PinType.CODE || pin.type === PinType.RIDDLE
        || pin.type === PinType.GHOST;
    const isCodeEntry = entersCode(pin.type);
    const isPhoto = pin.type === PinType.PHOTO;
    const isFeedback = pin.type === PinType.FEEDBACK;
    // The navbar centre collect button covers code/riddle/visit/feedback - photo submits via its own panel.
    const canCollect = !collected && !isPhoto;
    // A photo pin with no image sent yet: the centre button becomes the uploader.
    const canUploadPhoto = isPhoto && !collected;
    // Miasto is a city map with no floors (floorLabel null), so it renders as just the area name.
    const pinMap = getMap(pin.mapId);
    const locationLabel = pinMap
        ? [MAP_AREA_LABELS[pinMap.area], pinMap.floorLabel].filter(Boolean).join(' · ')
        : '';

    const photoApproved = isPhoto && collected && (collectedPin?.awardedPoints ?? 0) > 0;
    const photoPending = isPhoto && collected && !photoApproved;
    // Riddle answers stay free-text - arbitrary Polish phrases have no length rule.
    const codeLength = watch('answer').trim().length;
    const collectReady = (!isFeedback
        || (watch('rating') >= 1 && watch('talkName').trim().length >= MIN_TALK_NAME_LENGTH))
        && (!isCodeEntry || codeLength === CODE_LENGTH);

    const collect = (data: { answer: string, talkName: string, rating: number }) => {
        setLoading(true);

        collectPinFunction(needsAnswer
            ? { pinUid: pin.uid, answer: data.answer }
            : isFeedback
                ? { pinUid: pin.uid, rating: data.rating, talkName: data.talkName }
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
    // icons matter - useDynamicNavbar re-runs (and re-captures onClick) only when `icon` changes.
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
        disabledCenter: canCollect && !collectReady,
        animate: canCollect && collectReady
    });

    return (
        <>
            <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose}/>
            <div
                className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-3xl
                    bg-background p-4 pb-32 shadow-panel"
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-base opacity-70">{locationLabel}</span>
                    <button onClick={onClose} className="text-text-accent" aria-label="Zamknij">
                        <FontAwesomeIcon icon={faXmark} size="2x"/>
                    </button>
                </div>

                <PinIdentityStrip pin={pin} className="mt-2"/>

                <SheetSection>
                    <p className="whitespace-pre-line text-center font-semibold">{pin.description}</p>
                </SheetSection>

                {(pin.clue || pin.clueImage) &&
                    <SheetSection title="Wskazówka">
                        {pin.clue && <p className="whitespace-pre-line text-justify">{pin.clue}</p>}
                        {pin.clueImage &&
                            <img
                                className={'w-full ' + (pin.clue ? 'mt-4' : '')}
                                src={`/pin-clues/${pin.clueImage}.webp`}
                                alt="Wskazówka"
                            />
                        }
                    </SheetSection>
                }

                {canCollect && needsAnswer &&
                    <SheetSection
                        title={isCodeEntry ? 'Wpisz kod' : 'Rozwiąż zagadkę'}
                        loading={loading}
                        raised
                    >
                        <form onSubmit={handleSubmit(collect)}>
                            <div className="relative">
                                <input
                                    type="text"
                                    maxLength={isCodeEntry ? CODE_LENGTH : undefined}
                                    placeholder={isCodeEntry ? 'ABCDEFGHIJ' : 'Twoja odpowiedź'}
                                    className={'rounded-xl block w-full p-1 border-2 border-input-border'
                                        + ' text-center bg-input-background text-text-accent uppercase'
                                        + ' text-2xl shadow-inner-input tracking-wider font-semibold'
                                        + (isCodeEntry ? ' px-12' : '')}
                                    {...register('answer', { setValueAs: (value: string) => value.trim() })}
                                />
                                {isCodeEntry &&
                                    <button
                                        type="button"
                                        onClick={() => setScanning(true)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xl
                                            text-text-accent"
                                        aria-label="Skanuj kod"
                                    >
                                        <FontAwesomeIcon icon={faCamera}/>
                                    </button>
                                }
                            </div>
                            <p className="text-center pt-2">
                                {!isCodeEntry
                                    ? 'Kliknij przycisk, by potwierdzić.'
                                    : codeLength === CODE_LENGTH
                                        ? 'Gotowe, możesz potwierdzić'
                                        : `${codeLength}/${CODE_LENGTH} znaków`}
                            </p>
                        </form>
                    </SheetSection>
                }

                {canCollect && isFeedback &&
                    <SheetSection title="Oceń prelekcję" loading={loading} raised>
                        <form onSubmit={handleSubmit(collect)}>
                            <p className="text-center font-semibold mb-2">Jak oceniasz tę prelekcję?</p>
                            <StarRating value={watch('rating')} onChange={(value) => setValue('rating', value)}/>
                            <label className="block mt-4">
                                <span className="block text-center mb-1">
                                    Jak nazywa się prelekcja, na której byłaś / byłeś?
                                </span>
                                <input
                                    type="text"
                                    maxLength={MAX_TALK_NAME_LENGTH}
                                    placeholder="Nazwa prelekcji"
                                    className="rounded-xl block w-full p-1 border-2 border-input-border text-center
                                        bg-input-background text-text-accent text-lg shadow-inner-input
                                        font-semibold"
                                    {...register('talkName')}
                                />
                            </label>
                            <p className="text-center pt-2">
                                Ocenę możesz wystawić tylko raz.
                            </p>
                        </form>
                    </SheetSection>
                }

                {canCollect && !needsAnswer && !isFeedback &&
                    <SheetSection loading={loading} raised>
                        <p className="text-center font-semibold">Jesteś na miejscu? Kliknij przycisk, by zaliczyć.</p>
                    </SheetSection>
                }

                {isPhoto && !collected &&
                    <PhotoPinCollect ref={photoCollectRef} pinUid={pin.uid} onSubmitted={() => undefined}/>
                }

                {photoPending &&
                    <SheetSection raised>
                        <p className="text-center font-semibold">
                            Zdjęcie wysłane - oczekuje na weryfikację. Punkty zostaną dodane po zaakceptowaniu zdjęcia.
                        </p>
                    </SheetSection>
                }

                {photoApproved &&
                    <SheetSection raised>
                        <p className="text-center font-semibold">Zdjęcie zaakceptowane!</p>
                    </SheetSection>
                }

                {collected && !isPhoto &&
                    <SheetSection raised>
                        <p className="text-center font-semibold">To miejsce masz już odwiedzone!</p>
                    </SheetSection>
                }
            </div>

            {scanning &&
                <CodeScannerOverlay
                    onCode={(code) => {
                        setScanning(false);
                        typeAnswer(code);
                    }}
                    onCancel={() => setScanning(false)}
                />
            }
        </>
    );
}
