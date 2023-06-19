import ScreenTitle from '@/components/ScreenTitle';
import Panel from '@/components/Panel';
import LinkButton from '@/components/LinkButton';
import { useRouter } from 'next/router';
import { ReactNode, useContext } from 'react';
import { UserContext, UserContextType } from '@/utils/context';

export default function AuthCheck ({ children }: { children: ReactNode }) {
    const router = useRouter();
    const publicRoutes = ['', '/', '/enter', '/login', '/register'];
    const { user } = useContext<UserContextType>(UserContext);

    console.log(router.pathname);

    if (publicRoutes.includes(router.pathname) || (user && user.uid)) {
        return <>{children}</>;
    }

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Ślepa uliczka</ScreenTitle>
            <Panel title="Zgubiłeś się, Potter?">
                <div className={'w-full mt-2 mb-4 relative h-48'}>
                    <iframe src="https://giphy.com/embed/720g7C1jz13wI" width="100%" height="100%"
                            style={{
                                'position': 'absolute',
                                'border': 'none'
                            }} className="giphy-embed"
                            allowFullScreen></iframe>
                </div>

                <LinkButton href={'/'}>Uciekaj</LinkButton>
            </Panel>
        </main>
    );
}
