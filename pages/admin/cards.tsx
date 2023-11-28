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

export default function CardsPage () {
    const router = useRouter();
    const { user } = useContext<UserContextType>(UserContext);
    const [cards, setCards] = useState<Card[]>([]);

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
                const cards = snapshot.docs.map((doc) => doc.data() as Card)
                    .map((card): Card => {
                        card.collectedBy =
                            Object.values(card.collectedBy as any as { username: any, collectedAt: any })
                                .map(({
                                    username,
                                    collectedAt
                                }) => ({
                                    username,
                                    collectedAt: collectedAt.toDate() ?? ''
                                }))
                                .sort((a, b) =>
                                    a.collectedAt > b.collectedAt
                                        ? -1
                                        : (a.collectedAt < b.collectedAt ? 1 : 0)
                                ) as any;

                        return card;
                    })
                    .sort((a, b) => {
                            console.log(a);
                            console.log(b);

                            if (a.collectedBy.length === 0) {
                                return 1;
                            }

                            if (b.collectedBy.length === 0) {
                                return -1;
                            }

                            return (a.collectedBy[0] as any).collectedAt > (b.collectedBy[0] as any).collectedAt
                                ? -1
                                : ((a.collectedBy[0] as any).collectedAt < (b.collectedBy[0] as any).collectedAt
                                        ? 1
                                        : 0
                                );
                        }
                    );

                setCards(cards as Card[]);
            }
        );
    }, []);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Lista Kart</ScreenTitle>

            <Panel title="Karty" loading={!cards} className={'overflow-scroll'}>
                <table className="table-auto whitespace-nowrap">
                    <thead>
                        <tr className="text-left">
                            <th className="px-2">UID</th>
                            <th className="px-2">Nazwa</th>
                            <th className="px-2">Wartość</th>
                            <th className="px-2">Ilość osób</th>
                            <th className="px-2">Ostatnio zebrano</th>
                            <th className="px-2">Ostatnia osoba</th>
                            <th className="px-2">Komentarz</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cards.map((card, index) => (
                            <tr key={card.uid} className={index % 2 ? 'bg-amber-100' : ''}>
                                <td className="px-2">{card.uid}</td>
                                <td className="px-2">{card.name}</td>
                                <td className="px-2">{card.value}</td>
                                <td className="px-2">{card.collectedBy.length}</td>
                                <td className="px-2">
                                    {(card.collectedBy[0] as any)?.collectedAt.toLocaleString('pl-PL')}
                                </td>
                                <td className="px-2">{(card.collectedBy[0] as any)?.username}</td>
                                <td className="px-2">{card.comment}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </main>
    );
}
