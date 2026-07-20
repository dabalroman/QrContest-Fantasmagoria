import { useState } from 'react';
import Panel from '@/components/Panel';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { Page } from '@/Enum/Page';
import Metatags from '@/components/Metatags';
import ScreenTitle from '@/components/ScreenTitle';
import CodeScanner from '@/components/CodeScanner';

export default function ScannerPage () {
    const [code, setCode] = useState<string | null>(null);

    const router = useRouter();

    useDynamicNavbar({
        icon: code ? faCheck : faArrowLeft,
        animate: !!code,
        onClick: () => (code ? router.push(`${Page.COLLECT}/${code}`) : router.back())
    });

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Skaner"/>
            <ScreenTitle>Skaner</ScreenTitle>

            <div className="fixed bottom-0 left-0 flex w-screen h-screen justify-center items-center z-0">
                <div style={{
                    width: '80vw',
                    maxWidth: '800px'
                }}
                     className="relative flex flex-col-reverse pb-10"
                >
                    <Panel margin={false} className="text-center relative bottom-4 z-0 rounded-b-2xl w-full">
                        {!code && (
                            <>
                                <p className="pt-3 text-xl">Szukam kodu...</p>
                                <p className="pt-3">Gdy kod zostanie wykryty, ramka karty zrobi się zielona.</p>
                            </>
                        )}
                        {code && (
                            <>
                                <p className="pt-3 text-xl">Wykryto kod</p>
                                <p className="pt-3 text-3xl">{code}</p>
                                <p className="pt-3">Kliknij, by użyć kodu!</p>
                            </>
                        )}
                    </Panel>
                    <div className={'z-50 relative text-center'}>
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-5">
                            <p className="pb-2">Aby skorzystać ze skanera, musisz zezwolić na wykorzystanie aparatu.</p>
                            <p>
                                Jeżeli zapytanie o dostęp nie wyświetla się, to twoje urządzenie nie jest
                                kompatybilne lub jego ustawienia odmawiają dostępu do kamery.
                                W takim wypadku wpisz kod na ekranie &quot;Szukaj&quot;.
                            </p>
                        </div>
                        <div
                            style={{
                                height: '50vh',
                                maxHeight: '800px'
                            }}
                            className={
                                'bg-background flex justify-center items-center overflow-hidden w-full'
                                + ' box-border border-8 border-card-border rounded-2xl z-10'
                                + (code !== null ? ' border-lime-700' : '')
                                + (code !== null ? ' animate-flash' : '')
                            }
                        >
                            <CodeScanner onCode={setCode} className="w-full"/>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
