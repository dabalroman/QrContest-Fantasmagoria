import RankingRound, { UserRankingRecord } from '@/models/RankingRound';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faImagePortrait } from '@fortawesome/free-solid-svg-icons';
import User from '@/models/User';
import getGuildIcon from '@/utils/getGuildIcon';
import { GuildUid } from '@/models/Guild';
import React from 'react';

export default function RoundRankingTable ({
    user,
    currentRound,
    winnersOnly = false
}: { user: User | null, currentRound: RankingRound, winnersOnly?: boolean }) {
    return (
        <div>
            <table className="w-full text-left">
                <thead>
                    <tr className="text-text-dim">
                        <th>#</th>
                        <th>Gracz</th>
                        <th>Karty</th>
                        <th className="text-right">Punkty</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRound && currentRound.users
                        .filter((record: UserRankingRecord) =>
                            !winnersOnly || record.winnerInRound === currentRound.uid
                        )
                        .filter((record: UserRankingRecord) =>
                            !record.winnerInRound || record.winnerInRound === currentRound.uid
                        )
                        .map((
                            record: UserRankingRecord,
                            index: number
                        ) => (
                            <tr key={index} className={
                                (record.uid === user?.uid ? 'font-bold' : '')
                            }>
                                <td className="text-left">{index + 1}.</td>
                                <td>
                                    {
                                        record?.memberOf
                                            ? <FontAwesomeIcon
                                                className={`w-5 text-${record.memberOf}`}
                                                icon={getGuildIcon(record?.memberOf as GuildUid)}
                                                size="xs"
                                            />
                                            : <span className="w-5 inline-block"></span>
                                    }
                                    {record.username}
                                </td>
                                <td>
                                    <FontAwesomeIcon className="px-1" icon={faImagePortrait} size="sm"/>
                                    {record.amountOfCollectedCards}
                                </td>
                                <td className="text-right">
                                    <FontAwesomeIcon className="px-1" icon={faStar} size="sm"/>{record.score}
                                </td>
                            </tr>
                        ))}
                    {(!currentRound || !currentRound.users || currentRound.users.length === 0) &&
                        <tr>
                            <td colSpan={4} className="text-center">Ranking jest pusty.</td>
                        </tr>
                    }
                </tbody>
            </table>
            <div className="text-sm text-center mt-4">
                <span className="px-4"><FontAwesomeIcon icon={faImagePortrait}/> Ilość kart</span>
                <span className="px-4"><FontAwesomeIcon icon={faStar}/> Ilość punktów</span>
            </div>
        </div>
    );
}
