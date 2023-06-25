import ScreenTitle from '@/components/ScreenTitle';
import Metatags from '@/components/Metatags';
import Panel from '@/components/Panel';
import { useContext, useEffect, useState } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import { collection, onSnapshot, orderBy, query } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import RankingRound, { UserRankingRecord } from '@/models/RankingRound';
import CurrentRoundPanel from '@/components/ranking/CurrentRoundPanel';
import Button from '@/components/Button';
import RoundRankingTable from '@/components/ranking/RoundRankingTable';

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

    const isCurrentRoundOver = currentRound && currentRound?.to.getTime() < (new Date()).getTime();

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Ranking"/>
            <ScreenTitle>Ranking</ScreenTitle>
            <div>
                <Panel title={user?.username ?? '...'} loading={loading} className="text-center">
                    <p className="text-2xl mt-1">
                        <FontAwesomeIcon className="px-1" icon={faDiceD6} size="sm"/>{user?.score}
                    </p>
                    <p className='mt-2'>
                    {currentUserPlace !== -1
                        ? `Jesteś na ${currentUserPlace + 1}. miejscu!`
                        : `Nie brałeś/aś udziału w tej rundzie.`
                    }
                    </p>
                </Panel>

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

                {currentRound && isCurrentRoundOver &&
                    <Panel title="Zwycięzcy rundy" loading={loading}>
                        <RoundRankingTable user={user} currentRound={currentRound} top3={true}/>
                    </Panel>
                }

                {currentRound &&
                    <Panel title="Ranking rundy" loading={loading}>
                        <RoundRankingTable user={user} currentRound={currentRound}/>
                    </Panel>
                }
            </div>
        </main>
    );
}
