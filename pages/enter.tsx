import { signInWithPopup } from '@firebase/auth';
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

export default function EnterPage ({}) {
    const {
        authUser,
        userReady
    }: UserContextType = useContext(UserContext);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Login page"/>
            <ScreenTitle>Sesja</ScreenTitle>
            <Panel title="Session">
                {
                    authUser
                        ? (!userReady ? <UsernameForm authUser={authUser}/> : null)
                        : <SignInButton/>
                }
                <SignOutButton/>
            </Panel>
        </main>
    );
}

function SignInButton () {
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleAuthProvider);
    };

    return (
        <button className="btn-google" onClick={signInWithGoogle}>
            <img src={'/google.png'} alt="Google logo"/> Sign in with Google
        </button>
    );
}

function SignOutButton () {
    return <button onClick={() => auth.signOut()}>Sign out</button>;
}

function UsernameForm ({
    authUser
}: { authUser: AuthUser }) {
    const [username, setUsername] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const {
        user
    }: UserContextType = useContext(UserContext);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        const validation = /^[a-z0-9-.]{3,15}$/;

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
            toast.success('Rejestracja przebiegła pomyślnie!');
        } catch (e) {
            toast.error('Rejestracja konta nie powiodła się, spróbuj ponownie.');
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
        (!user?.username || true) && (
            <section>
                <h3>Choose username</h3>
                <form onSubmit={onSubmit}>
                    <input name="username" placeholder="username" value={username} onChange={onChange}/>
                    <UsernameMessage username={username} isValid={isValid} loading={loading}/>
                    <button type="submit" className="btn-green">Register</button>
                </form>

                <br/>
                <p>Form value: {username}</p>
                <p>Valid: {isValid.toString()}</p>
                <p>Loading: {loading.toString()}</p>
            </section>
        )
        || <p>No.</p>
    );
}

function UsernameMessage ({
    username,
    isValid,
    loading
}: { username: string, isValid: boolean, loading: boolean }) {
    if (loading) {
        return <p>Checking...</p>;
    } else if (isValid) {
        return <p className="text-success">{username} is available!</p>;
    } else if (username) {
        return <p className="text-danger">That username is already taken!</p>;
    }

    return <p></p>;
}
