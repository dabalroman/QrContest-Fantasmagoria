import ScreenTitle from '@/components/ScreenTitle';
import Panel from '@/components/Panel';
import LinkButton from '@/components/LinkButton';

export default function Custom404 () {
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
