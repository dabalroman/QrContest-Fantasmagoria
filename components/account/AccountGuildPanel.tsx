import Loader from '@/components/Loader';
import Guild from '@/models/Guild';
import User from '@/models/User';
import LinkButton from '@/components/LinkButton';
import { Page } from '@/Enum/Page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6, faUser } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import getGuildIcon from '@/utils/getGuildIcon';
import Panel from '@/components/Panel';

export default function AccountGuildPanel ({
    user,
    guild = null,
    loading = false
}: { user: User, guild: Guild | null, loading?: boolean, className?: string, title?: string }) {

    if (user.memberOf === null) {
        return (
            <Panel title="Gildia">
                <p className='mb-3'>
                    Nie jesteś członkiem żadnej gildii. Dołącz do towarzyszy i wspólnie wyruszcie w przygodę!
                </p>
                <LinkButton href={Page.GUILD}>Dołącz do gildii</LinkButton>
            </Panel>
        );
    }

    const title = (loading) ? 'Gildia' : guild?.name;

    return (
        <div
            className={
                ' rounded-md shadow-panel mr-2'
                + ' bg-gradient-to-b from-panel-transparent to-panel-transparent-end relative'
            }
        >
            <div className={loading ? 'blur-sm pointer-events-none' : ''}>
                <div className="w-full grid grid-cols-[1fr_7rem]">
                    <div className="p-4">
                        <h2 className="text-2xl font-fancy pb-2">{title}</h2>
                        <div className="flex justify-evenly text-2xl mb-2">
                            <span><FontAwesomeIcon icon={faDiceD6} size="xs"/> {guild?.score}</span>
                            <span><FontAwesomeIcon icon={faUser} size="xs"/> {guild?.amountOfMembers}</span>
                        </div>
                        <p className="text-sm text-text-half">
                            Wesprzyj gildię przez zdobywanie rubików lub rekrutację nowych towarzyszy!
                        </p>
                    </div>
                    {guild !== null && (
                        <div
                            className={
                                'relative border-6 rounded-xl bg-background bg-center bg-cover shadow-card left-2'
                                + ` h-full border-${guild.uid}`
                            }
                            style={{
                                'backgroundImage': `url(/guilds/${guild.uid}.webp)`
                            }}
                        >
                            <FontAwesomeIcon
                                icon={getGuildIcon(guild.uid)}
                                className="text-white p-2 absolute top-0 right-0"
                            />
                        </div>
                    )}
                </div>
            </div>
            {loading && <Loader/>}
        </div>
    );
}
