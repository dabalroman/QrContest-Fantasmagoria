import PanelComponent from '../PanelComponent';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { collectCardFunction } from '@/utils/functions';

export default function LookForCodeComponent ({ code = null }: { code?: string | null }) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState
    } = useForm({
        mode: 'onChange'
    });

    const { isValid } = formState;

    const collectCode = (data: any) => {
        console.log(data);
        collectCardFunction({
            code: data.code
        })
            .then((result) => console.log(result.data))
            .catch((error) => {
                console.log(error.code, error.message, error.details);
            });
        reset();
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
            <PanelComponent>
                <h2 className="text-2xl font-fancy pb-2">Zeskanuj kod</h2>
                <p>Użyj aparatu lub aplikacji do skanowania i dołącz do pogoni za skarbami!</p>
            </PanelComponent>

            <PanelComponent>
                <h2 className="text-2xl font-fancy pb-2">Wpisz kod ręcznie</h2>
                <p className="pb-2">Nie chcesz używać skanera skarbów? Wpisz kod tutaj.</p>

                <form onSubmit={handleSubmit(collectCode)}>
                    <input type="text" placeholder="code" maxLength={10}
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

                    <button type="submit" disabled={!isValid}>
                        Potwierdź
                    </button>
                </form>
            </PanelComponent>
        </div>
    );
}
