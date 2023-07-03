import Button from '@/components/Button';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Panel from '@/components/Panel';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { auth } from '@/utils/firebase';
import toast from 'react-hot-toast';
import Metatags from '@/components/Metatags';
import ScreenTitle from '@/components/ScreenTitle';
import { Page } from '@/Enum/Page';
import { UserContext, UserContextType } from '@/utils/context';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

export default function LoginEmail () {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const {
        authUser,
        userReady
    }: UserContextType = useContext(UserContext);

    useDynamicNavbar({
        onlyCenter: true,
        icon: faArrowLeft,
        onClick: () => router.back()
    });

    const {
        register,
        handleSubmit,
        reset,
        formState
    } = useForm({
        mode: 'onSubmit',
        defaultValues: {
            'email': '',
            'password': ''
        }
    });

    const registerUser = async (data: any) => {
        setLoading(true);

        try {
            await createUserWithEmailAndPassword(auth, data.email, data.password);
            toast.success('Rejestracja przebiegła pomyślnie!');
            setLoading(false);
            reset();
        } catch (e: any) {
            if(e.message.includes('email-already-in-use')){
                toast.error('Konto powiązane z tym adresem email już istnieje.');
            } else {
                toast.error('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
            }

            setLoading(false);
            console.log(e.message);
        }
    };

    useEffect(() => {
        if(authUser) {
            router.push(userReady ? Page.COLLECT : Page.ACCOUNT_SETUP).then();
        }
    }, [userReady, authUser, router]);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Rejestracja"/>
            <ScreenTitle>Rejestracja</ScreenTitle>

            <Panel title="Rejestracja adresem email" loading={loading}>
                <p className='mb-2'>Wpisz swój adres email i hasło. Potwierdzenie adresu email nie jest wymagane.</p>
                <form onSubmit={handleSubmit(registerUser)}>
                    <p>Adres email</p>
                    <input type="text"
                           className="rounded block w-full p-1 border-2 border-input-border my-2
                               bg-input-background text-text-light text-xl shadow-inner-input"
                           {...register(
                               'email',
                               {
                                   required: 'Wpisz adres email.',
                                   pattern: {
                                       value: /^.+@.+$/,
                                       message: 'Ten adres email nie wygląda poprawnie.'
                                   }
                               }
                           )} />

                    {formState.errors.email?.message && (
                        <p className="text-danger mb-2">{formState.errors.email?.message as string}</p>)}

                    <p className="mt-4">Hasło</p>
                    <input type="password"
                           className="rounded block w-full p-1 border-2 border-input-border my-2
                               bg-input-background text-text-light text-xl shadow-inner-input"
                           {...register(
                               'password',
                               {
                                   required: 'Wpisz hasło.',
                                   minLength: {
                                       value: 8,
                                       message: 'Hasło musi mieć co najmniej 8 znaków!'
                                   }
                               }
                           )} />

                    {formState.errors.password?.message && (
                        <p className="text-danger mb-2">{formState.errors.password?.message as string}</p>)}

                    <Button type="submit" className="w-full mt-4">
                        Zarejestruj
                    </Button>
                </form>
            </Panel>
        </main>
    );
}
