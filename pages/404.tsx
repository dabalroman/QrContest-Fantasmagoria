import ScreenTitle from '@/components/ScreenTitle';
import Panel from '@/components/Panel';
import LinkButton from '@/components/LinkButton';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { Page } from '@/Enum/Page';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Custom404 () {
    useDynamicNavbar({
        href: Page.MAIN,
        onlyCenter: true,
        icon: faArrowLeft
    });

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

                <LinkButton href={Page.MAIN}>Uciekaj</LinkButton>
            </Panel>
        </main>
    );
}
