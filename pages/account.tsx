import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import LinkButton from '@/components/LinkButton';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6, faImagePortrait } from '@fortawesome/free-solid-svg-icons';
import Metatags from '@/components/Metatags';
import { UserRole } from '@/Enum/UserRole';
import Button from '@/components/Button';
import { seedDatabaseFunction, updateRoundsFunction } from '@/utils/functions';
import toast from 'react-hot-toast';
import { Page } from '@/Enum/Page';
import { auth, firestore } from '@/utils/firebase';
import { useRouter } from 'next/router';
import Guild from '@/models/Guild';
import { doc, onSnapshot } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';
import CurrentGuildPanel from '@/components/account/CurrentGuildPanel';
import JoinGuildPanel from '@/components/account/JoinGuildPanel';
import BetrayGuildPanel from '@/components/account/BetrayGuildPanel';

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
            doc(firestore, FireDoc.GUILDS, user?.memberOf as string)
                .withConverter(Guild.getConverter()),
            (snapshot) => {
                const guild = snapshot.data() as Guild;
                setGuild(guild);
                setGuildLoading(false);
            }
        );
    }, [user?.memberOf]);

    const AdminSection = () => (
        <Panel title="Admin">
            <LinkButton href={Page.ADMIN_RECENTLY_COLLECTED} className={'mt-4'}>Ostatnio zebrane karty</LinkButton>
            <LinkButton href={Page.ADMIN_CARDS} className={'mt-4'}>Lista kart</LinkButton>
            <LinkButton href={Page.ADMIN_USERS} className={'mt-4'}>Lista użytkowników</LinkButton>

            <Button className="w-full mt-4" onClick={() => {
                updateRoundsFunction()
                    .then((result) => toast.success(result.data.result))
                    .catch((error) => toast.error('Update failed: ' + error.message));

            }}>Wymuś aktualizację rund</Button>

            <p className={'py-2 mt-20'}>Niebezpiecznie tutaj schodzić!</p>
            <Button className="w-full" style={{background: '#660000', borderColor: '#BB0000'}} onClick={() => {
                const proceed = confirm('Are you sure?') ?? false;

                if (!proceed) {
                    return;
                }

                const password = prompt('Password?') ?? '';

                if (!password) {
                    return;
                }

                seedDatabaseFunction({ password: password })
                    .then(() => toast.success('DB seed succeed.'))
                    .catch((error) => toast.error('DB seed failed: ' + error.message));

            }}>Seed database</Button>
        </Panel>
    );

    return user && (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Profil</ScreenTitle>
            <Metatags title="Profil"/>
            <div>
                <Panel title={user.username ?? '...'} className="text-center">
                    <div className="flex place-content-around text-4xl text-text-accent p-4">
                        <div>
                            <FontAwesomeIcon className="px-1" icon={faImagePortrait} size="sm"/>&nbsp;
                            {user?.amountOfCollectedCards}
                        </div>
                        <div><FontAwesomeIcon className="px-1" icon={faDiceD6} size="sm"/>&nbsp;{user?.score}</div>
                    </div>
                </Panel>

                {user.memberOf === null && <JoinGuildPanel/>}

                <Panel title="Nagrody i rundy">
                    <p className="text-center text-lg">
                        <span className='text-xl font-semibold text-text-accent tracking-wider'>
                            1. miejsce – 50 fantów
                        </span><br/>
                        <span className='text-xl'>2. miejsce – 35 fantów</span><br/>
                        <span className='text-md'>3. miejsce – 20 fantów</span><br/>
                    </p>
                    <p className="mt-2 text-justify">
                        Konkurs podzielony jest na dwie rundy. Daty rozpoczęcia i zakończenia każdej z nich znajdziesz
                        w zakładce &quot;Ranking&quot;. Punkty z rundy pierwszej przechodzą do rundy drugiej,
                        więc masz aż dwie szanse na wygraną! Każda runda to troje zwycięzców.
                    </p>
                    <p className='mt-2 text-justify'>
                        Zwycięzców zapraszamy po odbiór nagród do punktu informacyjnego konwentu w momencie
                        zakończenia rundy.
                    </p>
                </Panel>

                {user.memberOf && guild && <CurrentGuildPanel guild={guild} loading={guildLoading}/>}
                {user.memberOf && guild && <BetrayGuildPanel user={user} guild={guild}/>}

                <Panel title="Regulamin i pytania">
                    <p>
                        Masz pytania o sposób działania konkursu? Sprawdź sekcję &quot;Pytania i odpowiedzi&quot;.
                    </p>
                    <LinkButton className="mt-4" href={Page.FAQ}>Pytania i odpowiedzi</LinkButton>
                    <LinkButton className="mt-4" href={Page.RULEBOOK}>Regulamin konkursu</LinkButton>
                </Panel>

                <Panel title={'Kontakt'}>
                    <p className="text-justify">
                        Coś nie działa? Masz jakieś pytania? <br/>
                        W razie potrzeby możesz skontaktować się bezpośrednio z organizatorem konkursu przez
                        email <a href="mailto:dabalroman@gmail.com" className="underline">dabalroman@gmail.com</a> lub
                        przez <a href="https://m.me/roman.dabal" className="underline">messenger</a>.
                    </p>
                </Panel>

                <Panel title="Konto">
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

                {user.role === UserRole.ADMIN && <AdminSection/>}
            </div>
        </main>
    );
}
