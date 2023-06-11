import { useForm } from 'react-hook-form';
import Metatags from '@/components/Metatags';
import { collectCardFunction } from '@/utils/functions';
import { useContext } from 'react';
import { UserContext, UserContextType } from '@/utils/context';

export default function CollectPage ({}) {
    const { user } = useContext<UserContextType>(UserContext);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState
    } = useForm({
        mode: 'onChange'
    });

    const {
        isValid,
        isDirty
    } = formState;

    const collectCode = (data: any) => {
        console.log(data);
        collectCardFunction({ uid: user?.uid, code: data.code })
            .then((result) => console.log(result.data))
            .catch((error) => {
                console.log(error.code, error.message, error.details);
            });
        reset();
    };

    return (
        <main className="grid grid-rows-layout items-center min-h-screen">
            <Metatags title="Szukaj"/>
            <h1 className="font-fancy text-4xl p-4 uppercase text-right">Szukaj</h1>

            <div>
                <div className="panel">
                    <h2 className="text-2xl font-fancy pb-2">Zeskanuj kod</h2>
                    <p>Użyj aparatu lub aplikacji do skanowania i dołącz do pogoni za skarbami!</p>
                </div>

                <div className="panel">
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

                        <button type="submit" className="btn-green">
                            {isDirty ? 'Save Changes' : 'No changes detected'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
