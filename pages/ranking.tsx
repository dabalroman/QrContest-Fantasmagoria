import ScreenTitle from '@/components/ScreenTitle';
import Metatags from '@/components/Metatags';
import Panel from '@/components/Panel';
import { useContext, useEffect, useState } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6, faImagePortrait } from '@fortawesome/free-solid-svg-icons';
import { doc, onSnapshot } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import Ranking, { Record } from '@/models/Ranking';

export default function ScoreboardPage ({}) {
    const { user } = useContext<UserContextType>(UserContext);
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState<Ranking | null>(null);

    useEffect(() => {
        return onSnapshot(
            doc(firestore, FireDoc.RANKING, FireDoc.RANKING)
                .withConverter(Ranking.getConverter()),
            (snapshot) => {
                setRanking(snapshot.data() as Ranking);
                setLoading(false);
            }
        );
    }, []);

    const currentUserPlace: number = ranking?.records.findIndex((record: Record) => record.uid === user?.uid) ?? 1;

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Ranking"/>
            <ScreenTitle>Ranking</ScreenTitle>
            <div>
                <Panel title={user?.username ?? '...'} loading={loading} className="text-center">
                    <p className="text-2xl">
                        <FontAwesomeIcon className="px-1" icon={faDiceD6} size="sm"/>{user?.score}
                    </p>
                    <p>Zajmujesz {currentUserPlace + 1}. miejsce</p>
                </Panel>
                <Panel title="Ranking" loading={loading}>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-text-half">
                                <th>#</th>
                                <th>Poszukiwacz</th>
                                <th>Kolekcja</th>
                                <th>Rubiki</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking && ranking.records.map((record: Record, index: number) => (
                                <tr key={index} className={record.uid === user?.uid ? 'font-bold' : ''}>
                                    <td className="text-left">{index + 1}.</td>
                                    <td>{record.username}</td>
                                    <td>{record.amountOfCollectedCards}
                                        <FontAwesomeIcon className="px-1" icon={faImagePortrait} size="sm"/>
                                    </td>
                                    <td><FontAwesomeIcon className="px-1" icon={faDiceD6} size="sm"/>{record.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Panel>
            </div>
        </main>
    );
}
