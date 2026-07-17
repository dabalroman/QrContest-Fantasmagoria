import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { faBan, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Pin from '@/models/Pin';
import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import { PinType } from '@/Enum/PinType';
import { collectPinFunction } from '@/utils/functions';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import PinCardComponent from '@/components/pin/PinCardComponent';
import Panel from '@/components/Panel';

// The marker-click sheet. Reuses the SAME card the collect screen shows (decision 18) — Pin satisfies
// PinCardData structurally, so it passes straight in. The collect control is react-hook-form, NOT
// useState: useDynamicNavbar captures onClick once and excludes it from deps, so a useState value
// would submit stale; RHF's handleSubmit reads a ref-backed store, so the stale closure is harmless.
export default function PinSheet ({
    pin,
    collected,
    onClose,
    onCollected,
    onError
}: {
    pin: Pin,
    collected: boolean,
    onClose: () => void,
    onCollected: (collectedPin: CollectedPin, question: Question | null) => void,
    onError: (error: Error) => void
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const { register, handleSubmit } = useForm({ mode: 'onChange', defaultValues: { answer: '' } });

    const needsAnswer = pin.type === PinType.CODE || pin.type === PinType.RIDDLE;
    const notSupported = pin.type === PinType.FEEDBACK || pin.type === PinType.PHOTO;
    const canCollect = !collected && !notSupported;

    const collect = (data: { answer: string }) => {
        setLoading(true);

        collectPinFunction(needsAnswer
            ? { pinUid: pin.uid, answer: data.answer }
            : { pinUid: pin.uid }
        )
            .then((result) => {
                setLoading(false);
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

    useDynamicNavbar({
        icon: canCollect ? faCheck : faBan,
        onClick: canCollect ? handleSubmit(collect) : undefined,
        disabledCenter: !canCollect,
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

                {notSupported &&
                    <Panel>
                        <p className="text-center font-semibold">Wkrótce</p>
                    </Panel>
                }

                {collected &&
                    <Panel>
                        <p className="text-center font-semibold">To miejsce masz już odwiedzone!</p>
                    </Panel>
                }
            </div>
        </>
    );
}
