import ScreenTitle from '@/components/ScreenTitle';
import Panel from '@/components/Panel';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from '@firebase/firestore';
import { firestore } from '@/utils/firebase';
import { FireDoc } from '@/Enum/FireDoc';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import useAdminOnly from '@/hooks/useAdminOnly';
import User from '@/models/User';

export default function UsersAdminPage () {
    useAdminOnly();

    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);

    useDynamicNavbar({
        icon: faArrowLeft,
        onClick: () => router.back()
    });

    useEffect(() => {
        // Sort users by username filed ACS
        const q = query(collection(firestore, FireDoc.USERS), orderBy('username', 'asc'))
            .withConverter(User.getConverter());

        return onSnapshot(
            q,
            (snapshot) => {
                const users = snapshot.docs.map((doc) => doc.data() as User);

                setUsers(users as User[]);
            }
        );
    }, []);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Lista użytkowników</ScreenTitle>

            <Panel title="Karty" loading={!users} className={'overflow-scroll'}>
                <table className="table-auto whitespace-nowrap min-w-full">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">Nick</th>
                            <th className="p-2">Wynik</th>
                            <th className="p-2"># kart</th>
                            <th className="p-2"># pytań</th>
                            <th className="p-2">Gildia</th>
                            <th className="p-2">Ostatnia akcja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.uid} className={index % 2 ? 'bg-background' : ''}>
                                <td className="p-2">{user.username}</td>
                                <td className="p-2">{user.score}</td>
                                <td className="p-2">{user.amountOfCollectedCards}</td>
                                <td className="p-2">{user.amountOfAnsweredQuestions}</td>
                                <td className="p-2">{user.memberOf}</td>
                                <td className="p-2">{user.updatedAt.toLocaleString('pl-PL')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </main>
    );
}
