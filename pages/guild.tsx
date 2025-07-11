import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import Metatags from '@/components/Metatags';
import { firestore } from '@/utils/firebase';
import { useRouter } from 'next/router';
import { collection, onSnapshot, orderBy, query } from '@firebase/firestore';
import { FireDoc } from '@/Enum/FireDoc';
import Guild, {GuildUid} from '@/models/Guild';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faUser } from '@fortawesome/free-solid-svg-icons';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import Loader from '@/components/Loader';
import { joinGuildFunction } from '@/utils/functions';
import toast from 'react-hot-toast';
import { Page } from '@/Enum/Page';
import getGuildIcon from '@/utils/getGuildIcon';

export default function GuildPage () {
    const router = useRouter();
    const { user } = useContext<UserContextType>(UserContext);

    const [loading, setLoading] = useState<boolean>(true);
    const [guilds, setGuilds] = useState<Guild[] | null>(null);
    const [selectedGuildUid, setSelectedGuildUid] = useState<GuildUid | null>((user?.memberOf as GuildUid) ?? null);

    const joinGuild = (guildUid: GuildUid | null) => {
        if (typeof guildUid !== 'string') {
            toast.error('Nie udało się dołączyć do klubu. Spróbuj ponownie.');
            return;
        }

        if (guildUid === user?.memberOf) {
            toast.error('Jesteś już członkiem tego klubu.');
        }

        setLoading(true);
        joinGuildFunction({ guild: guildUid })
            .then(() => {
                    toast.success(`Dołączono do klubu!`);
                    setLoading(false);
                    router.push(Page.ACCOUNT);
                }
            )
            .catch((error) => {
                    if (error.message === 'cooldown') {
                        toast.error('Nie możesz jeszcze zmienić klubu. Spróbuj później.');
                    } else {
                        toast.error('Nie udało się dołączyć do klubu. Spróbuj ponownie.');
                    }
                    setLoading(false);
                }
            );
    };

    const selectionValid = selectedGuildUid !== null && selectedGuildUid !== user?.memberOf;
    useDynamicNavbar({
        icon: selectionValid ? faCheck : faArrowLeft,
        animate: selectionValid,
        href: !selectionValid ? Page.COLLECT : undefined,
        onClick: selectionValid ? () => joinGuild(selectedGuildUid) : undefined
    });

    useEffect(() => {
        const q = query(collection(firestore, FireDoc.GUILDS), orderBy('name', 'asc'))
            .withConverter(Guild.getConverter());

        return onSnapshot(
            q,
            (snapshot) => {
                const guilds = snapshot.docs.map((doc) => doc.data() as Guild);

                setGuilds(guilds);
                setLoading(false);
            }
        );
    }, []);

    const selectedGuild: Guild | undefined = guilds?.find((guild: Guild) => guild.uid === selectedGuildUid);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Klub</ScreenTitle>
            <Metatags title="Klub"/>
            <div>
                {loading && <Loader/>}

                <Panel title={selectedGuild?.name ?? 'Wybór Klubu'} className="text-center">
                    {selectedGuild
                        ? (<p className='text-justify'>{selectedGuild.description}</p>)
                        : (
                            <>
                                <p>W klubie znajdziesz ludzi, którzy kochają to, co Ty!</p>
                                <p className="text-sm text-text-dim mt-2">
                                    Wybór klubu nie wpływa na Twoje szanse na wygraną, ma charakter kosmetyczny.
                                </p>
                            </>
                        )}
                </Panel>

                <div className="grid grid-cols-2 gap-4">
                    {guilds?.map((guild: Guild) => (
                        <div
                            key={guild.uid}
                            onClick={() => setSelectedGuildUid(guild.uid)}
                            className={
                                'relative border-6 rounded-xl bg-background bg-center bg-cover shadow-card'
                                + ' w-full cursor-pointer'
                                + ` border-${guild.uid}`
                            }
                            style={{
                                'backgroundImage': `url(/guilds/${guild.uid}.webp)`,
                                'minHeight': '14rem',
                                'filter': (guild.uid === selectedGuildUid ? 'contrast(1)' : 'contrast(0.8)'),
                                'transform': (guild.uid === selectedGuildUid ? 'scale(1)' : 'scale(0.9)')
                            }}
                        >
                            <div
                                className={
                                    `bg-${guild.uid}`
                                    + ' absolute -bottom-1 w-full text-center p-1 text-white uppercase text-'
                                }
                            >
                                <div>{guild.name}</div>
                                <div>
                                    <span><FontAwesomeIcon icon={faUser} size="xs"/> {guild.amountOfMembers}</span>
                                </div>
                            </div>
                            <FontAwesomeIcon
                                icon={getGuildIcon(guild.uid)}
                                size="xl"
                                className={`bg-${guild.uid} p-3 pl-4 absolute top-0 right-0 text-white rounded-bl-2xl`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
