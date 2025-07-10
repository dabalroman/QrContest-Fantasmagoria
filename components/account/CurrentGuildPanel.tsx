import Loader from '@/components/Loader';
import Guild from '@/models/Guild';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faStar, faUser } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import getGuildIcon from '@/utils/getGuildIcon';

export default function CurrentGuildPanel ({
    guild,
    loading = false
}: { guild: Guild, loading?: boolean, className?: string, title?: string }) {
    const title = (loading) ? 'Klub' : guild.name;

    return (
        <div
            className={
                ' rounded-md shadow-panel rounded-tr-2xl'
                + ' bg-panel-transparent relative'
            }
        >
            <div className={loading ? 'blur-sm pointer-events-none' : ''}>
                <div className="w-full grid grid-cols-[1fr_6rem]">
                    <div className="p-4 pt-8 pb-7 text-text-accent">
                        <h2 className="text-2xl pb-2 text-center font-semibold">{title}</h2>
                        <div className="text-xl grid grid-cols-3 pt-0.5 text-center">
                            <span><FontAwesomeIcon icon={faBolt}/> {guild.power}</span>
                            <span><FontAwesomeIcon icon={faUser}/> {guild.amountOfMembers}</span>
                            <span><FontAwesomeIcon icon={faStar}/> {guild.score}</span>
                        </div>
                    </div>
                    <div
                        className={
                            'relative border-6 rounded-xl bg-background bg-center bg-cover shadow-card'
                            + ` h-full border-${guild.uid}`
                        }
                        style={{
                            'backgroundImage': `url(/guilds-thumbnails/${guild.uid}.webp)`
                        }}
                    >
                        <FontAwesomeIcon
                            icon={getGuildIcon(guild.uid)}
                            className={`bg-${guild.uid} p-2 pb-3 pl-3 absolute top-0 right-0 text-white`
                                + ' rounded-bl-2xl'}
                        />
                    </div>
                </div>
                <div className="w-full p-4">
                    <p className="text-sm text-justify">
                        {guild.description}
                    </p>
                </div>
            </div>
            {loading && <Loader/>}
        </div>
    );
}
