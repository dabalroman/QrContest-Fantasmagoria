import Card from '@/models/Card';
import ScreenTitle from '@/components/ScreenTitle';
import Panel from '@/components/Panel';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Page } from '@/Enum/Page';
import { collection, onSnapshot, query } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import useAdminOnly from '@/hooks/useAdminOnly';

export default function CardsAdminPage () {
    useAdminOnly();

    const router = useRouter();
    const [cards, setCards] = useState<Card[]>([]);

    useDynamicNavbar({
        icon: faArrowLeft,
        onClick: () => router.back()
    });

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
                    .sort((a: Card, b: Card) => a.name.localeCompare(b.name, 'pl'));

                setCards(cards as Card[]);
            }
        );
    }, []);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Lista Kart</ScreenTitle>

            <Panel title="Karty" loading={!cards} className={'overflow-scroll'}>
                <table className="table-auto whitespace-nowrap min-w-full">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">N</th>
                            <th className="p-2">PKT</th>
                            <th className="p-2">Nazwa</th>
                            <th className="p-2">Ostatnia osoba</th>
                            <th className="p-2">Ostatnio zebrano</th>
                            <th className="p-2">Komentarz</th>
                            <th className="p-2">Kod</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cards.map((card, index) => (
                            <tr key={card.uid} className={index % 2 ? 'bg-background' : ''}>
                                <td className="p-2">{card.collectedBy.length}</td>
                                <td className="p-2">{card.value}</td>
                                <td className="p-2">{card.comment}</td>
                                <td className="p-2">
                                    <a href={`${Page.ADMIN_EDIT_CARD}/${card.code}`}>{card.name}</a>
                                </td>
                                <td className="p-2">{(card.collectedBy[0] as any)?.username}</td>
                                <td className="p-2">
                                    {(card.collectedBy[0] as any)?.collectedAt.toLocaleString('pl-PL')}
                                </td>
                                <td className="p-2 font-mono">{card.code}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </main>
    );
}
