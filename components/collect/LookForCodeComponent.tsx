import Panel from '../Panel';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { collectCardFunction } from '@/utils/functions';
import Button from '@/components/Button';
import Card from '@/models/Card';
import Question from '@/models/Question';

export default function LookForCodeComponent ({
    code = null,
    onCodeValid,
    onCodeInvalid
}: {
    code?: string | null,
    onCodeValid: (card: Card, question: Question | null) => void,
    onCodeInvalid: (error: Error) => void
}) {
    const [loading, setLoading] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState
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

                console.log(result.data);
                onCodeValid(
                    Card.fromRaw(result.data.card),
                    result.data.question ? Question.fromRaw(result.data.question) : null
                );
            })
            .catch((error) => {
                setLoading(false);
                onCodeInvalid(error);
            });
    };

    useEffect(() => {
        if (code !== null) {
            setValue(
                'code',
                code,
                {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                }
            );
        }
    }, [code, setValue]);

    return (
        <div>
            <Panel title="Zeskanuj kod">
                <p>Użyj aparatu lub aplikacji do skanowania i dołącz do pogoni za skarbami!</p>
            </Panel>

            <Panel title="Wpisz kod ręcznie" loading={loading}>
                <p className="pb-2">Nie chcesz używać skanera skarbów? Wpisz kod tutaj.</p>

                <form onSubmit={handleSubmit(collectCode)}>
                    <input type="text" placeholder="ABCDEFGHIJ" maxLength={10}
                           className="rounded block w-full p-1 border-2 border-input-border text-center
                               bg-input-background text-text-light uppercase text-xl shadow-inner-input tracking-wider"
                           {...register(
                               'code',
                               {
                                   required: 'Wpisz kod',
                                   pattern: {
                                       value: /^[A-z0-9]{10}$/,
                                       message: 'Kod musi składać się z 10 znaków.'
                                   }
                               }
                           )} />

                    {formState.errors.code?.message && (
                        <p className="text-danger">{formState.errors.code?.message as string}</p>)}

                    <Button type="submit" className="w-full mt-3">
                        Potwierdź
                    </Button>
                </form>
            </Panel>
        </div>
    );
}
