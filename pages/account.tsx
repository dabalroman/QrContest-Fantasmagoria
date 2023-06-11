import Link from 'next/link';
import Panel from '@/components/Panel';
import ScreenTitle from '@/components/ScreenTitle';
import LinkButton from '@/components/LinkButton';

export default function AccountPage ({}) {
    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <ScreenTitle>Profil</ScreenTitle>
            <Panel>
                <LinkButton href={'/enter'}>Login / logout</LinkButton>
                <br/>
                <LinkButton href={'/admin/card'}>Card</LinkButton>
            </Panel>
        </main>
    );
}
