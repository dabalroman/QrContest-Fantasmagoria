import { signInWithPopup } from '@firebase/auth';
import { useContext, useEffect, useState } from 'react';
import Metatags from '@/components/Metatags';
import { UserContext, UserContextType } from '@/utils/context';
import { auth, googleAuthProvider } from '@/utils/firebase';
import toast from 'react-hot-toast';
import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import Button from '@/components/Button';
import { router } from 'next/client';
import { Page } from '@/Enum/Page';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LinkButton from '@/components/LinkButton';

export default function LoginPage () {
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

    const signInWithGoogle = async () => {
        setLoading(true);

        try {
            await signInWithPopup(auth, googleAuthProvider);
            toast.success('Logowanie pomyślne!');
            setLoading(false);
        } catch (e) {
            toast.error('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authUser) {
            router.push(userReady ? Page.COLLECT : Page.ACCOUNT_SETUP)
                .then();
        }
    }, [userReady, authUser]);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Logowanie"/>
            <ScreenTitle>{!(authUser && userReady) ? 'Zaloguj' : 'Wyloguj'}</ScreenTitle>

            <Panel title="Zaloguj się" loading={loading}>
                <p className="pb-2">Wybierz metodę logowania:</p>
                <Button onClick={signInWithGoogle} className="w-full mb-4">
                    <img src={'/google.png'} alt="Google logo" className="inline-block w-6 mr-2 relative bottom-0.5"/>
                    Konto Google
                </Button>
                <LinkButton href={Page.LOGIN_EMAIL} className="w-full mb-4">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2"/>
                    Adres Email
                </LinkButton>
                <p className="mt-2 text-center text-sm">Biorąc udział w konkursie akceptujesz warunki regulaminu
                    uczestnictwa.</p>
            </Panel>
        </main>
    );
}
