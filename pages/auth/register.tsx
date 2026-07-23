import {signInWithPopup} from '@firebase/auth';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Metatags from '@/components/Metatags';
import {UserContext, UserContextType} from '@/utils/context';
import {auth, googleAuthProvider} from '@/utils/firebase';
import toast from 'react-hot-toast';
import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import Button from '@/components/Button';
import {Page} from '@/Enum/Page';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import {faArrowLeft, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LinkButton from '@/components/LinkButton';
import {useRouter} from 'next/router';
import {destinationAfterAuth} from '@/utils/pendingCode';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const {
        authUser,
        authLoading,
        userLoading,
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
            setLoading(false);
        } catch (e: any) {
            toast.error('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
            setLoading(false);
        }
    };

    // See login.tsx - router is a dependency, so the push re-runs this effect and a second
    // destinationAfterAuth() would find the stash already spent.
    const redirectedRef = useRef<boolean>(false);

    useEffect(() => {
        if (redirectedRef.current || authLoading || userLoading || !authUser) {
            return;
        }

        redirectedRef.current = true;
        router.push(userReady ? destinationAfterAuth() : Page.ACCOUNT_SETUP)
            .then();
    }, [userReady, authUser, router, authLoading, userLoading]);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Dołącz do konkursu"/>
            <ScreenTitle>Rejestracja</ScreenTitle>

            <Panel title="Dołącz do konkursu" loading={loading}>
                <p className="pb-4">Wybierz metodę rejestracji:</p>
                <Button onClick={signInWithGoogle} className="w-full mb-4">
                    <img src={'/google.png'} alt="Google logo" className="inline-block w-6 mr-2 relative bottom-0.5"/>
                    Konto Google
                </Button>
                <LinkButton href={Page.REGISTER_EMAIL} className="w-full mb-4">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2"/>
                    Adres Email
                </LinkButton>
                <p className='text-center mt-4'>Potwierdzenie adresu email nie jest wymagane.</p>
                <p className="mt-2 text-center text-sm text-text-dim">
                    Biorąc udział w konkursie akceptujesz warunki regulaminu uczestnictwa.
                </p>
            </Panel>
        </main>
    );
}
