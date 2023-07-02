import React, { useCallback, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from '@firebase/firestore';
import debounce from 'lodash.debounce';
import Metatags from '@/components/Metatags';
import { UserContext, UserContextType } from '@/utils/context';
import { auth, firestore } from '@/utils/firebase';
import toast from 'react-hot-toast';
import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import Button from '@/components/Button';
import { router } from 'next/client';
import { Page } from '@/Enum/Page';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft, faCheck, faDiceD6, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm } from 'react-hook-form';
import { setupAccountFunction } from '@/utils/functions';

export default function AccountSetupPage () {
    const [loading, setLoading] = useState<boolean>(false);
    const [checking, setChecking] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(false);

    const { authUser }: UserContextType = useContext(UserContext);

    useDynamicNavbar({
        onlyCenter: true,
        icon: faArrowLeft,
        onClick: () => router.back()
    });

    if (!authUser) {
        router.push(Page.MAIN)
            .then();
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            'username': ''
        }
    });

    const username = watch('username');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkUsername = useCallback(
        debounce(async (username: string) => {
            if (username.length >= 3) {
                setChecking(true);
                const ref = doc(firestore, 'users-usernames', username);
                const snapshot = await getDoc(ref);
                setIsValid(!snapshot.exists());
                setChecking(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        checkUsername(username);
    }, [checkUsername, username]);

    const onSubmit = async (data: any) => {
        if (!isValid || !authUser) {
            toast.error('Wpisz poprawny nick.');
            return;
        }

        setLoading(true);
        try {
            await setupAccountFunction({ username: data.username });
            toast.success('Rejestracja przebiegła pomyślnie!');
            await router.push(Page.COLLECT);
            setLoading(false);
            reset();
        } catch (e) {
            toast.error('Rejestracja nie powiodła się, spróbuj ponownie.');
            await router.push(Page.MAIN);
            await auth.signOut();
            setLoading(false);
        }
    };

    const onError = async (data: any) => {
        toast.error(data.username.message);
    };

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Rejestracja"/>
            <ScreenTitle>Rejestracja</ScreenTitle>
            <Panel title="Wybierz swój nick" loading={loading}>
                <section>
                    <p className="text-justify">
                        Twój nick będzie widoczny dla innych.
                        Użycie wulgarnego lub niecenzuralnego nicku spowoduje usunięcie konta.
                    </p>
                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <input
                            placeholder="Morning-Angel"
                            className={'rounded block w-full p-1 border-2 border-input-border text-center mt-4' +
                                ' bg-input-background text-text-light text-xl shadow-inner-input'}
                            {...register(
                                'username',
                                {
                                    required: 'Wpisz swój nick',
                                    minLength: {
                                        value: 3,
                                        message: 'Nick musi mieć co najmniej 3 znaki!'
                                    }
                                }
                            )}
                        />

                        <p className="py-2 text-center">
                            {errors.username?.message
                                ? (errors.username?.message as string)
                                : UsernameMessage({
                                    username,
                                    isValid,
                                    checking: checking
                                })
                            }
                        </p>
                        <Button
                            type="submit"
                            className="w-full mt-2"
                        >
                            Gotowe
                        </Button>
                    </form>
                </section>
            </Panel>
        </main>
    );
}

function UsernameMessage ({
    username,
    isValid,
    checking
}: { username: string, isValid: boolean, checking: boolean }) {
    if (checking) {
        return <>
            <FontAwesomeIcon icon={faDiceD6} size="sm" spin className="mr-2"/>
            Sprawdzanie...
        </>;
    } else if (isValid) {
        return <>
            <FontAwesomeIcon icon={faCheck} size="sm" className="mr-2"/>
            Ten nick jest dostępny!
        </>;
    } else if (username) {
        return <>
            <FontAwesomeIcon icon={faX} size="sm" className="mr-2"/>
            Ten nick jest już zajęty!
        </>;
    }

    return 'Wpisz swój nick.';
}
