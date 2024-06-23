import RankingRound, { UserRankingRecord } from '@/models/RankingRound';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6, faImagePortrait } from '@fortawesome/free-solid-svg-icons';
import User from '@/models/User';
import getGuildIcon from '@/utils/getGuildIcon';
import { GuildUid } from '@/models/Guild';
import React from 'react';

export default function RoundRankingTable ({
    user,
    currentRound,
    top3 = false
}: { user: User | null, currentRound: RankingRound, top3?: boolean }) {
    return (
        <div>
            <table className="w-full text-left">
                <thead>
                    <tr className="text-text-dim">
                        <th>#</th>
                        <th>Poszukiwacz</th>
                        <th>Karty</th>
                        <th className="text-right">Rubiki</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRound && currentRound.users
                        .filter((record: UserRankingRecord, index: number) => !top3 || index < 3)
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
                                    <FontAwesomeIcon className="px-1" icon={faDiceD6} size="sm"/>{record.score}
                                </td>
                            </tr>
                        ))}
                    {(!currentRound.users || currentRound.users.length === 0) &&
                        <tr><td colSpan={4} className="text-center">Ranking jest pusty.</td></tr>
                    }
                </tbody>
            </table>
            <div className="text-sm text-center mt-4">
                <span className="px-4"><FontAwesomeIcon icon={faImagePortrait}/> Ilość kart</span>
                <span className="px-4"><FontAwesomeIcon icon={faDiceD6}/> Ilość Rubików</span>
            </div>
        </div>
    );
}
