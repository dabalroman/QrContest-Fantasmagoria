import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import LinkButton from '@/components/LinkButton';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import Metatags from '@/components/Metatags';
import { UserRole } from '@/Enum/UserRole';
import Button from '@/components/Button';
import { seedDatabaseFunction } from '@/utils/functions';
import toast from 'react-hot-toast';
import { HttpsCallableResult } from '@firebase/functions';
import { Page } from '@/Enum/Page';
import { auth, firestore } from '@/utils/firebase';
import { useRouter } from 'next/router';
import Guild from '@/models/Guild';
import { doc, onSnapshot } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';
import AccountGuildPanel from '@/components/account/AccountGuildPanel';

export default function AccountPage () {
    const router = useRouter();
    const { user } = useContext<UserContextType>(UserContext);

    const [guild, setGuild] = useState<Guild | null>(null);
    const [guildLoading, setGuildLoading] = useState<boolean>(false);

    useEffect(() => {
        if (user?.memberOf === null) {
            return;
        }

        setGuildLoading(true);

        return onSnapshot(
            doc(firestore, FireDoc.GUILDS, user?.memberOf as string),
            (snapshot) => {
                const guild = snapshot.data() as Guild;
                setGuild(guild);
                setGuildLoading(false);
            }
        );
    }, [user?.memberOf]);

    const AdminSection = () => (
        <Panel title="Admin">
            <LinkButton href={'/admin/card'}>Card</LinkButton>
            <Button className="w-full mt-4" onClick={() => {
                seedDatabaseFunction()
                    .then((data: HttpsCallableResult) => {
                        if ((data.data as any).status === 'ok') {
                            toast.success('DB seed succeed.');
                        } else {
                            toast.error('DB seed failed');
                        }
                    });
            }}>Seed database</Button>
        </Panel>
    );

    return user && (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Profil</ScreenTitle>
            <Metatags title="Profil"/>
            <div>
                <Panel title={user.username ?? '...'} className="text-center">
                    <p className="text-2xl">
                        <FontAwesomeIcon className="px-1" icon={faDiceD6} size="sm"/>{user.score}
                    </p>
                </Panel>

                {user.role === UserRole.ADMIN && <AdminSection/>}

                <AccountGuildPanel user={user} guild={guild} loading={guildLoading}/>

                {user.memberOf !== null && (
                    <Panel title="Zdrada Gildii">
                        <p className={'mb-3'}>Możesz zdradzić swoich towarzyszy by dołączyć do innej gildii. Tego
                            haniebnego czynu możesz dokonać tylko raz.</p>
                        <LinkButton href={Page.GUILD}>Zdradź Gildię</LinkButton>
                    </Panel>
                )}

                <Panel title="Regulamin">
                    <ol className="list-decimal list-inside">
                        <li>Nie będziesz miał konkursów cudzych przede mną</li>
                        <li>Nie będziesz Glidii swej wyzywał na daremno</li>
                        <li>Pamiętaj, być skarb złoty czyścił</li>
                        <li>Czcij konwent swój</li>
                        <li>Nie łam regulaminu</li>
                    </ol>
                </Panel>

                <Panel title="Wyloguj">
                    <p className="pb-4 text-justify">
                        Kliknij tutaj, by wylogować się z aplikacji. Do zobaczenia!
                    </p>
                    <Button
                        onClick={async () => {
                            await router.push(Page.MAIN);
                            await auth.signOut();
                            toast.success('Wylogowano pomyślnie.');
                        }}
                        className="w-full"
                    >
                        Wyloguj
                    </Button>
                </Panel>
            </div>
        </main>
    );
}
