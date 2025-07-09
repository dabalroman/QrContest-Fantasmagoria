import ScreenTitle from '@/components/ScreenTitle';
import Metatags from '@/components/Metatags';
import Panel from '@/components/Panel';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faDiceD6, faImagePortrait, faUser } from '@fortawesome/free-solid-svg-icons';
import { collection, onSnapshot, orderBy, query } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import RankingRound, { GuildRankingRecord, UserRankingRecord } from '@/models/RankingRound';
import CurrentRoundPanel from '@/components/ranking/CurrentRoundPanel';
import Button from '@/components/Button';
import RoundRankingTable from '@/components/ranking/RoundRankingTable';
import getGuildIcon from '@/utils/getGuildIcon';
import LinkButton from '@/components/LinkButton';
import { Page } from '@/Enum/Page';

export default function ScoreboardPage ({}) {
    const { user } = useContext<UserContextType>(UserContext);
    const [loading, setLoading] = useState(true);
    const [rankingRounds, setRankingRounds] = useState<RankingRound[]>([]);
    const [currentRound, setCurrentRound] = useState<RankingRound | null>(null);

    useEffect(() => {
        const q = query(collection(firestore, FireDoc.RANKING), orderBy('from', 'asc'))
            .withConverter(RankingRound.getConverter());

        return onSnapshot(
            q,
            (snapshot) => {
                const rounds = snapshot.docs.map((doc) => doc.data() as RankingRound);
                const currentRoundIndex =
                    rounds.findIndex((round: RankingRound) => (round.to.getTime() >= (new Date()).getTime()));

                setRankingRounds(rounds);
                setCurrentRound(rounds[currentRoundIndex] ?? rounds[rounds.length - 1]);
                setLoading(false);
            }
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentUserPlace: number = currentRound?.users
        .findIndex((record: UserRankingRecord) => record.uid === user?.uid) ?? -1;
    const currentGuildPlace: number = currentRound?.guilds
        .findIndex((guild: GuildRankingRecord) => guild.uid === user?.memberOf) ?? -1;

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Ranking"/>
            <ScreenTitle>Ranking</ScreenTitle>
            <div>
                <Panel title={user?.username ?? '...'} loading={loading} className="text-center">
                    <div className="flex place-content-around text-4xl text-text-accent p-4">
                        <div>
                            <FontAwesomeIcon className="px-1" icon={faImagePortrait} size="sm"/>&nbsp;
                            {user?.amountOfCollectedCards}
                        </div>
                        <div><FontAwesomeIcon className="px-1" icon={faDiceD6} size="sm"/>&nbsp;{user?.score}</div>
                    </div>

                    {!user?.winnerInRound && (
                        currentUserPlace !== -1
                            ? <p className="mt-2">Jesteś na <b>{currentUserPlace + 1}.</b> miejscu w rankingu!</p>
                            : <p className="mt-2">Nie brałeś/aś udziału w tej rundzie.</p>
                    )}

                    {!user?.memberOf && (
                        <p className="mt-4">
                            <span>Nie jesteś członkiem żadnej gildii.</span>
                        </p>
                    )}

                    {user?.memberOf && !user?.winnerInRound && currentRound?.guilds[currentGuildPlace] && (
                        <p className="mt-4">
                            {currentRound?.guilds[currentGuildPlace].name}
                            {currentGuildPlace !== -1
                                ? ` zajmuje ${currentGuildPlace + 1}. miejsce.`
                                : ' nie znajduje się w rankingu.'
                            }
                        </p>
                    )}
                </Panel>

                {user?.winnerInRound &&
                    <Panel title={'Wygrana!'}>
                        <p>Odwiedź punkt informacyjny konwentu aby odebrać Twoją nagrodę. </p>
                    </Panel>
                }

                {currentRound &&
                    <CurrentRoundPanel currentRound={currentRound} loading={loading}/>
                }

                <div className="flex justify-center gap-4">
                    {rankingRounds.map((round: RankingRound) => (
                        <Button key={round.uid} className="w-full" onClick={() => setCurrentRound(round)}>
                            Runda {round.name}
                        </Button>)
                    )}
                </div>

                {currentRound && currentRound.finished &&
                    <Panel title="Mistrzowie rundy" loading={loading}>
                        <RoundRankingTable user={user} currentRound={currentRound} winnersOnly={true}/>
                    </Panel>
                }

                <Panel title="Ranking Gildii">
                    <div>
                        {currentRound?.guilds &&
                            currentRound.guilds.map((guild: GuildRankingRecord) => (
                                <div key={guild.uid} className="mb-4 grid gap-4 grid-cols-[4rem_1fr]">
                                    <div
                                        className={
                                            'border-4 rounded-lg bg-background bg-center bg-cover shadow-card'
                                            + ` h-full border-${guild.uid}`
                                        }
                                        style={{
                                            'backgroundImage': `url(/guilds-thumbnails/${guild.uid}.webp)`
                                        }}
                                    >
                                    </div>
                                    <div className="my-2">
                                        <p className={'pb-0.5' + (user?.memberOf === guild.uid ? ' font-bold' : '')}>
                                            <FontAwesomeIcon
                                                className={`text-${guild.uid} mr-1`}
                                                icon={getGuildIcon(guild?.uid)}
                                                size="xs"
                                            /> {guild.name}
                                        </p>
                                        <div className="grid grid-cols-3 pt-0.5">
                                            <span><FontAwesomeIcon icon={faBolt}/> {guild.power}</span>
                                            <span><FontAwesomeIcon icon={faUser}/> {guild.amountOfMembers}</span>
                                            <span><FontAwesomeIcon icon={faDiceD6}/> {guild.score}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        {(!currentRound?.guilds || currentRound.guilds.length === 0) &&
                            <p className="text-center">Ranking jest pusty.</p>
                        }
                    </div>
                    <div className="text-sm text-center mt-4">
                        <span className="px-4"><FontAwesomeIcon icon={faBolt}/> Siła gildii</span>
                        <span className="px-4"><FontAwesomeIcon icon={faUser}/> Ilość członków</span>
                        <br/>
                        <span className="px-4">
                            <FontAwesomeIcon icon={faDiceD6}/> Suma Rubików wszystkich członków
                        </span>
                    </div>
                </Panel>

                {currentRound &&
                    <Panel title="Ranking rundy" loading={loading}>
                        {user?.winnerInRound && parseInt(user.winnerInRound) < parseInt(currentRound.uid) &&
                            <p className="text-center mb-4 text-text-dim">
                                Wygrałeś/aś w poprzedniej rundzie, dlatego nie jesteś widoczny/a w tym rankingu!
                            </p>
                        }

                        <RoundRankingTable user={user} currentRound={currentRound}/>
                    </Panel>
                }
            </div>
        </main>
    );
}
