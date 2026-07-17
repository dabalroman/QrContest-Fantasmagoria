import Panel from '../Panel';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { collectPinFunction } from '@/utils/functions';
import CollectedPin from '@/models/CollectedPin';
import Question from '@/models/Question';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faCamera, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Page } from '@/Enum/Page';
import Button, { ButtonState } from '@/components/Button';
import LinkButton from '@/components/LinkButton';
import toast from 'react-hot-toast';

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
    const typingAnimationIntervalRef = useRef<number | null>(null);
    const [typingAnimationText, setTypingAnimationText] = useState<string>('');

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

    useEffect(() => {
        if (code === null || code.length !== 10) {
            return;
        }

        if (typingAnimationText.length >= 10 && typingAnimationIntervalRef.current !== null) {
            window.clearInterval(typingAnimationIntervalRef.current as number);
            return;
        }

        if (typingAnimationIntervalRef.current !== null) {
            return;
        }

        typingAnimationIntervalRef.current = window.setInterval(() => {
            setTypingAnimationText((value) => code.slice(0, value.length + 1));
        }, 150);
    }, [code, currentInput, setValue, typingAnimationText]);

    useEffect(() => {
        setValue(
            'code',
            typingAnimationText,
            {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
            }
        );
    }, [setValue, typingAnimationText]);

    return (
        <div>
            <Panel title="Hej, zanim zaczniesz..." closeable={true} closeableUuid={'look-for-code-view-intro'}>
                <p className="mb-1 text-justify">
                    Kodów nie ukryliśmy w salach prelekcyjnych i zajęciowych. Każdy z nich jest w Twoim zasięgu.
                    Staraj się nie przeszkadzać innym konwentowiczom podczas swoich poszukiwań.
                </p>
            </Panel>

            <Panel title="Wpisz kod miejsca" loading={loading}>
                <form onSubmit={handleSubmit(collectCode, onInvalidInput)}>
                    <input type="text" placeholder="ABCDEFGHIJ" maxLength={10}
                           className="rounded-xl block w-full p-1 border-2 border-input-border text-center
                               bg-input-background text-text-accent uppercase text-2xl shadow-inner-input
                               tracking-wider font-semibold"
                           {...register(
                               'code',
                               {
                                   setValueAs: (value: string) => value.trim(),
                                   required: 'Kod miejsca składa się z 10 znaków',
                                   pattern: {
                                       value: /^[A-z0-9]{10}$/,
                                       message: 'Kod miejsca składa się z 10 znaków'
                                   }
                               }
                           )} />

                    <p className="text-center pt-2">
                        {
                            formState.errors.code?.message || currentInput.length === 0
                                ? formState.errors.code?.message
                                : 'Kod gotowy — potwierdź poniżej!'
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

            <Panel title="Zeskanuj kod miejsca">
                <p>Nie chcesz wpisywać kodu ręcznie? Zeskanuj go aparatem. Możesz też użyć dowolnej innej
                    aplikacji do skanowania.</p>
                <LinkButton href={Page.SCANNER} className="w-full mt-4">
                    <FontAwesomeIcon icon={faCamera}/> Skanuj aparatem
                </LinkButton>
            </Panel>
        </div>
    );
}
