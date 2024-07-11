import Panel from '../Panel';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { collectCardFunction } from '@/utils/functions';
import Card from '@/models/Card';
import Question from '@/models/Question';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faCamera, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Page } from '@/Enum/Page';
import toast from 'react-hot-toast';

export default function LookForCodeView ({
    code = null,
    onCodeValid,
    onCodeInvalid
}: {
    code?: string | null,
    onCodeValid: (card: Card, question: Question | null) => void,
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

        collectCardFunction({ code: data.code })
            .then((result) => {
                setLoading(false);
                reset();

                onCodeValid(
                    Card.fromRaw(result.data.card),
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
    const showScanner = currentInput.length === 0;
    useDynamicNavbar({
        icon: showScanner ? faCamera : faCheck,
        animate: showScanner || formState.isValid || currentInput === code,
        href: showScanner ? Page.SCANNER : undefined,
        onClick: !showScanner ? handleSubmit(collectCode, onInvalidInput) : undefined
    });

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
            <Panel title="Zeskanuj kod karty">
                <p>Kliknij w przycisk aparatu i zeskanuj kod!</p>
                <p>Możesz też użyć innej aplikacji do skanowania.</p>
            </Panel>

            <Panel title="Wpisz kod karty" loading={loading}>
                <p className="pb-4">Tutaj możesz wpisać znaleziony kod.</p>

                <form onSubmit={handleSubmit(collectCode)}>
                    <input type="text" placeholder="ABCDEFGHIJ" maxLength={10}
                           className="rounded block w-full p-1 border-2 border-input-border text-center
                               bg-input-background text-text-accent uppercase text-2xl shadow-inner-input
                               tracking-wider"
                           {...register(
                               'code',
                               {
                                   required: 'Kod karty składa się z 10 znaków',
                                   pattern: {
                                       value: /^[A-z0-9]{10}$/,
                                       message: 'Kod karty składa się z 10 znaków'
                                   }
                               }
                           )} />

                    <p className="text-center pt-2">
                        {
                            formState.errors.code?.message || currentInput.length === 0
                                ? formState.errors.code?.message
                                : 'Kliknij, by potwierdzić kod!'
                        }
                    </p>
                </form>
            </Panel>
        </div>
    );
}
