import Panel from '../Panel';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { collectPinFunction } from '@/utils/functions';
import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import useTypingAnimation from '@/hooks/useTypingAnimation';
import { faCamera, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button, { ButtonState } from '@/components/Button';
import CodeScannerOverlay from '@/components/CodeScannerOverlay';
import toast from 'react-hot-toast';
import scheduleAchievementToasts from '@/utils/scheduleAchievementToasts';
import PinMarkerIcon from '@/components/map/PinMarkerIcon';
import { PinType } from '@/Enum/PinType';

const CODE_LENGTH = 10;
const CODE_HINT = 'Kod składa się z 10 znaków';

export default function LookForCodeView ({
    code = null,
    onCodeValid,
    onCodeInvalid
}: {
    code?: string | null,
    onCodeValid: (pin: CollectedPin, question: Question | null) => void,
    onCodeInvalid: (error: Error) => void
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [scanning, setScanning] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState,
        watch
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            'code': ''
        }
    });

    const collectCode = (data: any) => {
        setLoading(true);

        collectPinFunction({ code: data.code })
            .then((result) => {
                setLoading(false);
                reset();

                scheduleAchievementToasts(result.data.achievements);

                onCodeValid(
                    CollectedPin.fromRaw(result.data.pin),
                    result.data.question ? Question.fromRaw(result.data.question) : null
                );
            })
            .catch((error) => {
                setLoading(false);
                onCodeInvalid(error);
                setValue('code', '');
            });
    };

    const onInvalidInput: SubmitErrorHandler<{ code: string }> = ({ code }) => {
        toast.error(code?.message ?? 'Błąd kodu.');
    };

    // noinspection TypeScriptValidateTypes
    const currentInput = watch('code');

    // Scan is demoted to an in-page action; the navbar centre stays Map (default) so the map is always
    // one tap away from the collect screen.
    useDynamicNavbar({});

    const typeCode = useTypingAnimation((text) => setValue(
        'code',
        text,
        {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        }
    ));

    useEffect(() => {
        if (code === null || code.length !== CODE_LENGTH) {
            return;
        }

        typeCode(code);
    }, [code, typeCode]);

    return (
        <div>
            <Panel title="Hej, zanim zaczniesz..." closeable={true} closeableUuid={'look-for-code-view-intro'}>
                <p className="mb-1 text-justify">
                    Kodów nie ukryliśmy w salach prelekcyjnych i zajęciowych. Każdy z nich jest w Twoim zasięgu.
                    Staraj się nie przeszkadzać innym konwentowiczom podczas swoich poszukiwań.
                </p>
            </Panel>

            <Panel title="Przepisz kod QR" loading={loading}>
                <form onSubmit={handleSubmit(collectCode, onInvalidInput)}>
                    <div className="relative">
                        <input type="text" placeholder="ABCDEFGHIJ" maxLength={CODE_LENGTH}
                               className="rounded-xl block w-full p-1 px-12 border-2 border-input-border
                                   text-center bg-input-background text-text-accent uppercase text-2xl
                                   shadow-inner-input tracking-wider font-semibold"
                               {...register(
                                   'code',
                                   {
                                       setValueAs: (value: string) => value.trim(),
                                       required: CODE_HINT,
                                       pattern: {
                                           value: /^[A-z0-9]{10}$/,
                                           message: CODE_HINT
                                       }
                                   }
                               )} />
                        <button
                            type="button"
                            onClick={() => setScanning(true)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-text-accent"
                            aria-label="Skanuj kod"
                        >
                            <FontAwesomeIcon icon={faCamera}/>
                        </button>
                    </div>

                    <p className="text-center pt-2">
                        {
                            formState.isValid
                                ? 'Gotowe, możesz potwierdzić'
                                : currentInput.length > 0
                                    ? `${currentInput.length}/${CODE_LENGTH} znaków`
                                    : <><PinMarkerIcon type={PinType.CODE} inline/> {CODE_HINT}</>
                        }
                    </p>

                    <Button
                        type="submit"
                        state={formState.isValid ? ButtonState.ENABLED : ButtonState.DISABLED}
                        className="w-full mt-2"
                    >
                        <FontAwesomeIcon icon={faCheck}/> Potwierdź kod
                    </Button>
                </form>
            </Panel>

            <Panel title="Zeskanuj kod QR">
                <p>Nie chcesz wpisywać <PinMarkerIcon type={PinType.CODE} inline/> kodu ręcznie? Zeskanuj go
                    aparatem. Możesz też użyć dowolnej innej aplikacji do skanowania.</p>
                <Button onClick={() => setScanning(true)} className="w-full mt-4">
                    <FontAwesomeIcon icon={faCamera}/> Skanuj aparatem
                </Button>
            </Panel>

            {scanning &&
                <CodeScannerOverlay
                    onCode={(scannedCode) => {
                        setScanning(false);
                        typeCode(scannedCode);
                    }}
                    onCancel={() => setScanning(false)}
                />
            }
        </div>
    );
}
