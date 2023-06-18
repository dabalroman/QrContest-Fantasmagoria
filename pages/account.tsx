import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import LinkButton from '@/components/LinkButton';
import { useContext } from 'react';
import { UserContext, UserContextType } from '@/utils/context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import Metatags from '@/components/Metatags';
import { UserRole } from '@/Enum/UserRole';

export default function AccountPage ({}) {
    const { user } = useContext<UserContextType>(UserContext);

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Profil</ScreenTitle>
            <Metatags title="Profil"/>
            <div>
                <Panel title={user?.username ?? '...'} className="text-center">
                    <p className="text-2xl">
                        <FontAwesomeIcon className="px-1" icon={faDiceD6} size="sm"/>{user?.score}
                    </p>
                </Panel>

                {
                    user?.role === UserRole.ADMIN && (
                        <Panel title="Admin">
                            <LinkButton href={'/admin/card'}>Card</LinkButton>
                        </Panel>
                    )
                }

                <Panel title="Regulamin">
                    <ol className="list-decimal list-inside">
                        <li>Nie będziesz miał konkursów cudzych przede mną</li>
                        <li>Nie będziesz Glidii swej wyzywał na daremno</li>
                        <li>Pamiętaj, być skarb złoty czyścił</li>
                        <li>Czcij konwent swój</li>
                        <li>Nie łam regulaminu</li>
                    </ol>
                </Panel>

                <Panel title='Wyloguj'>
                    <p className='pb-4 text-justify'><b>Uwaga!</b>
                        Jeżeli wybrałeś/aś logowanie anonimowe (bez konta Google lub maila),
                        to ponowne zalogowanie się nie będzie możliwe.
                    </p>
                    <LinkButton href={'/enter'}>Wyloguj</LinkButton>
                </Panel>
            </div>
        </main>
    );
}
