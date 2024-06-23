import Card from '@/models/Card';
import ScreenTitle from '@/components/ScreenTitle';
import Panel from '@/components/Panel';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { UserRole } from '@/Enum/UserRole';
import { Page } from '@/Enum/Page';
import { collection, onSnapshot, query } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';

type RecentlyCollectedEntry = { uid: string, name: string, code: string, username: string, collectedAt: Date }

export default function RecentlyCollectedCardsPage () {
    const router = useRouter();
    const { user } = useContext<UserContextType>(UserContext);
    const [listOfEntries, setListOfEntries] = useState<RecentlyCollectedEntry[]>([]);

    useEffect(() => {
        if (!user || user?.role !== UserRole.ADMIN) {
            router.push(Page.COLLECT)
                .then();
        }
    }, [router, user]);

    useEffect(() => {
        const q = query(collection(firestore, FireDoc.CARDS))
            .withConverter(Card.getConverter());

        return onSnapshot(
            q,
            (snapshot) => {
                const listOfEntries: RecentlyCollectedEntry[] = [];

                snapshot.docs.map((doc) => doc.data() as Card)
                    .forEach((card): Card => {
                        const localEntries: RecentlyCollectedEntry[] =
                            Object.values(card.collectedBy as any as { username: any, collectedAt: any })
                                .map(({
                                    username,
                                    collectedAt
                                }) => ({
                                    uid: card.uid,
                                    name: card.name,
                                    code: card.code,
                                    username,
                                    collectedAt: collectedAt.toDate() ?? ''
                                })) as RecentlyCollectedEntry[];

                        listOfEntries.push(...localEntries);

                        return card;
                    });

                listOfEntries.sort((a, b) => {
                        return a.collectedAt > b.collectedAt
                            ? -1
                            : (a.collectedAt < b.collectedAt ? 1 : 0);
                    }
                );

                setListOfEntries(listOfEntries);
            }
        );
    }, []);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Ostatnio zebrane karty</ScreenTitle>

            <Panel title="" loading={!listOfEntries} className={'overflow-scroll'}>
                <table className="table-auto whitespace-nowrap">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">Karta</th>
                            <th className="p-2">Osoba</th>
                            <th className="p-2">Data</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {listOfEntries.map((entry, index) => (
                            <tr key={entry.uid + entry.collectedAt} className={index % 2 ? 'bg-background' : ''}>
                                <td className="p-2">
                                    <a href={`${Page.ADMIN_EDIT_CARD}/${entry.code}`}>{entry.name}</a>
                                </td>
                                <td className="p-2">{entry.username}</td>
                                <td className="p-2">{entry.collectedAt.toLocaleString('pl-PL')}</td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </main>
    );
}
