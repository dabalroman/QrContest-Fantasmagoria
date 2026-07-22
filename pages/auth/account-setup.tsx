import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { doc, getDoc } from '@firebase/firestore';
import debounce from 'lodash.debounce';
import Metatags from '@/components/Metatags';
import { UserContext, UserContextType } from '@/utils/context';
import { auth, firestore } from '@/utils/firebase';
import toast from 'react-hot-toast';
import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import Button from '@/components/Button';
import { Page } from '@/Enum/Page';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft, faCheck, faMapLocationDot, faStar, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm } from 'react-hook-form';
import { setupAccountFunction } from '@/utils/functions';
import canonicalUsername from '@/functions/src/actions/canonicalUsername';
import { useRouter } from 'next/router';

export default function AccountSetupPage () {
    const router = useRouter();
    const { authUser, userReady }: UserContextType = useContext(UserContext);

    const [loading, setLoading] = useState<boolean>(false);
    const [checking, setChecking] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [step, setStep] = useState<'nick' | 'welcome'>('nick');
    const [isVeteran, setIsVeteran] = useState<boolean>(false);

    // userReady flips from the useUserData snapshot the moment the handler commits, i.e. while the
    // callable is still awaiting - so this has to be a ref, armed before the await, or the redirect
    // below fires mid-registration and eats the welcome step.
    const registeringRef = useRef<boolean>(false);

    useDynamicNavbar(step === 'welcome'
        ? { onlyCenter: true, icon: faMapLocationDot, href: Page.MAP }
        : { onlyCenter: true, icon: faArrowLeft, onClick: () => router.back() }
    );

    useEffect(() => {
        if (userReady && !registeringRef.current) {
            router.push(Page.MAP)
                .then();
        }
    }, [userReady, router]);


    useEffect(() => {
        if (!authUser) {
            router.push(Page.MAIN)
                .then();
        }
    }, [authUser, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            'username': '',
            'isReturningPlayer': false
        }
    });

    const username = watch('username');
    const checkedUsernameRef = useRef<string>('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkUsername = useCallback(
        debounce(async (username: string) => {
            if (canonicalUsername(username).length >= 3) {
                const ref = doc(firestore, 'users-usernames', canonicalUsername(username));
                const snapshot = await getDoc(ref);
                // The field may have changed again while the getDoc was in flight; applying that
                // verdict would re-open the stale window the effect below closes.
                if (checkedUsernameRef.current !== username) {
                    return;
                }
                setIsValid(!snapshot.exists());
                setChecking(false);
            }
        }, 500),
        []
    );

    // isValid must never outlive the string it was computed for - otherwise a fast edit-then-submit
    // passes the onSubmit guard with the previous nick's verdict and the callable rejects the nick.
    useEffect(() => {
        checkedUsernameRef.current = username;
        setIsValid(false);
        setChecking(canonicalUsername(username).length >= 3);
        checkUsername(username);
    }, [checkUsername, username]);

    const onSubmit = async (data: any) => {
        if (!isValid || !authUser) {
            toast.error('Wpisz poprawny nick.');
            return;
        }

        const isReturningPlayer = data.isReturningPlayer === true;

        registeringRef.current = true;
        setIsVeteran(isReturningPlayer);
        setLoading(true);

        try {
            await setupAccountFunction({ username: data.username, isReturningPlayer });
            toast.success('Rejestracja przebiegła pomyślnie!');
            setStep('welcome');
            setLoading(false);
        } catch (error) {
            registeringRef.current = false;

            if((error as Error).message === 'username does not meet requirements') {
                toast.error('Ten nick nie spełnia wymagań.');
            } else if((error as Error).message === 'nickname already taken') {
                toast.error('Ktoś właśnie zajął ten nick, wybierz inny.');
                setIsValid(false);
            } else {
                toast.error('Rejestracja nie powiodła się, spróbuj ponownie.');
                await router.push(Page.MAIN);
                await auth.signOut();
            }
            setLoading(false);
        }
    };

    const onError = async (data: any) => {
        toast.error(data.username.message);
    };

    if (step === 'welcome') {
        return (
            <main className="grid grid-rows-layout items-center min-h-screen p-4">
                <Metatags title="Rejestracja"/>
                <ScreenTitle>Rejestracja</ScreenTitle>
                <div>
                    {isVeteran && <Panel title={'Witaj ponownie!'}>
                        <p className="text-justify">
                            Cieszymy się, że wracasz do Gry Konwentowej!<br/>
                            W tej edycji nie musisz tropić kodów po całym konwencie.
                            Większość zadań to zagadki i miejsca do odwiedzenia,
                            a kody czekają przeważnie na widoku.
                            Jeśli któryś jest ukryty, to mapa pokaże Ci okolicę, w której go szukać.
                        </p>
                    </Panel>}
                    <Panel title={'Konto gotowe!'}>
                        <section>
                            <p className="text-justify">
                                Gra Konwentowa toczy się na mapie w aplikacji
                                - zbierasz pinezki i punkty, odkrywając konwent krok po kroku.
                                Sprawdź mapę, by wybrać gdzie wyruszysz najpierw!
                            </p>
                            <Button
                                className="w-full mt-4"
                                onClick={() => router.push(Page.MAP)}
                            >
                                Zaczynamy!
                            </Button>
                        </section>
                    </Panel>
                </div>
            </main>
        );
    }

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
                            placeholder="Grzegżółka42"
                            className={'rounded-xl block w-full p-1 border-2 border-input-border text-center mt-4' +
                                ' bg-input-background text-text-accent text-xl shadow-inner-input'}
                            {...register(
                                'username',
                                {
                                    required: 'Wpisz swój nick',
                                    validate: {
                                        // Length is judged on the trimmed value, the way the server does
                                        // it - otherwise spaces pad a too-short nick past the rule.
                                        minLength: (value: string) => value.trim().length >= 3
                                            || 'Nick musi mieć co najmniej 3 znaki!',
                                        maxLength: (value: string) => value.trim().length <= 20
                                            || 'Spróbuj zmieścić się w 20 znakach.'
                                    },
                                    pattern: {
                                        value: /^[A-z0-9ąćęłóśźż\-\s&$#@.<>(){}:;+]+$/i,
                                        message: 'Możesz użyć znaków alfabetu i cyfry.'
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
                        <div className="mt-6 mb-2">
                            <p className="text-left pb-3">Czy grasz z nami po raz kolejny?</p>
                            <label className="flex items-center justify-center gap-2">
                                <input type="checkbox" className="w-5 h-5" {...register('isReturningPlayer')}/>
                                <span>Tak, znam Grę Konwentową z poprzednich lat</span>
                            </label>
                        </div>
                        <Button
                            type="submit"
                            className="w-full mt-4"
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
            <FontAwesomeIcon icon={faStar} size="sm" spin className="mr-2"/>
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
