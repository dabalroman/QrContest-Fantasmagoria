import { createUserWithEmailAndPassword, signInWithPopup } from '@firebase/auth';
import { ChangeEvent, FormEvent, useCallback, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from '@firebase/firestore';
import debounce from 'lodash.debounce';
import Metatags from '@/components/Metatags';
import { AuthUser, UserContext, UserContextType } from '@/utils/context';
import { auth, firestore, googleAuthProvider } from '@/utils/firebase';
import User from '@/models/User';
import toast from 'react-hot-toast';
import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import Button, { ButtonState } from '@/components/Button';
import { router } from 'next/client';
import { Page } from '@/Enum/Page';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function EnterPage ({}) {
    const {
        authUser,
        userReady
    }: UserContextType = useContext(UserContext);

    useDynamicNavbar({
        onlyCenter: true,
        icon: faArrowLeft,
        onClick: () => router.back()
    });

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleAuthProvider);
        } catch (e) {
            toast.error('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
        }
    };

    const signInWithEmail = async () => {
        try {
            await createUserWithEmailAndPassword(auth, 'xxx@xx.xx', 'xxxxxx');
        } catch (e) {
            toast.error('Niepoprawny login lub hasło. Spróbuj ponownie.');
            console.log(e);
        }
    };

    const loginPanel = (
        <Panel title={'Zaloguj się'}>
            <p className="pb-2">Wybierz metodę logowania:</p>
            <Button onClick={signInWithGoogle} className="w-full mb-4">
                <img src={'/google.png'} alt="Google logo" className="inline-block w-6 mr-2 relative bottom-0.5"/>
                Konto Google
            </Button>
            <Button onClick={signInWithEmail} className="w-full mb-4">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2"/>
                Adres Email
            </Button>
            <p className="text-center">Adres email nie wymaga potwierdzenia.</p>
            <p className="mt-2">Biorąc udział w konkursie akceptujesz warunki regulaminu uczestnictwa.</p>
        </Panel>
    );

    const logoutPanel = (
        <Panel>
            <p className="pb-4">Kliknij by wylogować się z aplikacji. <br/> Do zobaczenia!</p>
            <Button onClick={async () => {
                await router.push(Page.MAIN);
                await auth.signOut();
            }} className="w-full">Wyloguj</Button>
        </Panel>
    );

    const nicknamePanel = (
        <UsernameForm authUser={authUser as AuthUser}/>
    );

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Logowanie"/>
            <ScreenTitle>{!(authUser && userReady) ? 'Zaloguj' : 'Wyloguj'}</ScreenTitle>

            {authUser && userReady && logoutPanel}

            {authUser && !userReady && nicknamePanel}

            {!authUser && loginPanel}
        </main>
    );
}

function UsernameForm ({
    authUser
}: { authUser: AuthUser }) {
    const [username, setUsername] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        const validation = /^[a-z0-9-.]{3,20}$/;

        if (value.length < 3) {
            setUsername(value);
            setLoading(false);
            setIsValid(false);
        }

        if (validation.test(value)) {
            setUsername(value);
            setLoading(true);
            setIsValid(false);
        }
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await User.createAccount(authUser.uid, username);
            await router.push(Page.COLLECT);
            toast.success('Rejestracja przebiegła pomyślnie!');
        } catch (e) {
            toast.error('Rejestracja nie powiodła się, spróbuj ponownie.');
        }
    };

    const checkUsername = useCallback(
        debounce(async (username: string) => {
            if (username.length >= 3) {
                const ref = doc(firestore, 'users-usernames', username);
                const snapshot = await getDoc(ref);
                setIsValid(!snapshot.exists());
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        checkUsername(username);
    }, [checkUsername, username]);

    return (
        <Panel title={'Wybierz swój nick'}>
            <section>
                <p className='text-justify'>
                    Twój nick będzie widoczny dla innych.
                    Użycie wulgarnego lub niecenzuralnego nicku spowoduje usunięcie konta.
                </p>
                <form onSubmit={onSubmit}>
                    <input
                        name="username"
                        placeholder="Morning-Angel"
                        value={username}
                        onChange={onChange}
                        className={'rounded block w-full p-1 border-2 border-input-border text-center mt-4' +
                            ' bg-input-background text-text-light uppercase text-xl shadow-inner-input tracking-wider'}
                    />
                    <p className="py-2 text-center">
                        {UsernameMessage({
                            username,
                            isValid,
                            loading
                        })}
                    </p>
                    <Button
                        type="submit"
                        className="w-full mt-2"
                        state={isValid ? ButtonState.ENABLED : ButtonState.DISABLED}
                    >
                        Gotowe
                    </Button>
                </form>
            </section>
        </Panel>
    );
}

function UsernameMessage ({
    username,
    isValid,
    loading
}: { username: string, isValid: boolean, loading: boolean }) {
    if (loading) {
        return 'Sprawdzanie...';
    } else if (isValid) {
        return 'Ten nick jest dostępny!';
    } else if (username) {
        return 'Ktoś już używa tego nick\'a!';
    }

    return 'Wpisz swój nick.';
}
