import Button, { ButtonState } from '@/components/Button';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Panel from '@/components/Panel';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { auth } from '@/utils/firebase';
import toast from 'react-hot-toast';
import Metatags from '@/components/Metatags';
import ScreenTitle from '@/components/ScreenTitle';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Page } from '@/Enum/Page';
import { UserContext, UserContextType } from '@/utils/context';
import { useRouter } from 'next/router';

export default function LoginEmail () {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    useDynamicNavbar({
        onlyCenter: true,
        icon: faArrowLeft,
        onClick: () => router.back()
    });

    const {
        authUser,
        userReady
    }: UserContextType = useContext(UserContext);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            'email': '',
            'password': ''
        }
    });

    const loginUser = async (data: any) => {
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast.success('Witaj ponownie!');
            setLoading(false);
            reset();
        } catch (e) {
            toast.error('Niepoprawny login lub hasło. Spróbuj ponownie.');
            setLoading(false);
            console.error(e);
        }
    };

    useEffect(() => {
        if(authUser) {
            router.push(userReady ? Page.COLLECT : Page.ACCOUNT_SETUP).then();
        }
    }, [userReady, authUser, router]);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Logowanie"/>
            <ScreenTitle>Zaloguj</ScreenTitle>

            <Panel loading={loading}>
                <p className="mb-2">Wpisz dane, które zostały użyte do rejestracji.</p>
                <form onSubmit={handleSubmit(loginUser)}>
                    <p>Adres email</p>
                    <input type="text"
                           className="rounded-xl block w-full p-1 border-2 border-input-border my-2
                               bg-input-background text-text-accent text-xl shadow-inner-input"
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

                    {errors.email?.message && (
                        <p className="text-danger mb-2">{errors.email?.message as string}</p>)}

                    <p className="mt-4">Hasło</p>
                    <input type="password"
                           className="rounded-xl block w-full p-1 border-2 border-input-border my-2
                               bg-input-background text-text-accent text-xl shadow-inner-input"
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

                    {errors.password?.message && (
                        <p className="text-danger mb-2">{errors.password?.message as string}</p>)}

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        state={errors.email || errors.password ? ButtonState.DISABLED : ButtonState.ENABLED}
                    >
                        Zaloguj
                    </Button>
                </form>
            </Panel>
        </main>
    );
}
