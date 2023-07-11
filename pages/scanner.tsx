import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import Panel from '@/components/Panel';
import useDynamicNavbar from '@/hooks/useDynamicNavbar';
import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { Page } from '@/Enum/Page';
import Metatags from '@/components/Metatags';
import ScreenTitle from '@/components/ScreenTitle';

export default function ScannerPage () {
    const ref = useRef<HTMLVideoElement>(null);
    const [code, setCode] = useState<string | null>(null);

    const router = useRouter();
    const qrScannerRef = useRef<QrScanner | null>(null);

    useDynamicNavbar({
        icon: code ? faCheck : faArrowLeft,
        animate: !!code,
        onClick: () => (code ? router.push(`${Page.COLLECT}/${code}`) : router.back())
    });

    const handleCodeDetection = (code: string) => {

        const collectUrl: string = process.env.NEXT_PUBLIC_CODE_COLLECT_URL ?? 'env-not-found';
        const regex = /^[A-Za-z0-9]{8,10}$/;

        if (code.includes(collectUrl)) {
            code = code.replace(collectUrl, '');

            if (regex.test(code)) {
                setCode(code);
            }
        }
    };

    useEffect(() => {
        let init = false;

        qrScannerRef.current = ref.current ? new QrScanner(
            ref.current,
            (result) => handleCodeDetection(result.data),
            {
                maxScansPerSecond: 4,
                preferredCamera: 'environment',
                highlightCodeOutline: false,
                highlightScanRegion: false,
                returnDetailedScanResult: true
            }
        ) : null;

        const interval = setInterval(() => {
            if (!init && ref.current && qrScannerRef.current !== null) {
                qrScannerRef.current?.start();
                init = true;
                clearInterval(interval);
            }
        }, 1000);

        return () => {
            qrScannerRef.current?.destroy();
            clearInterval(interval);
        };
    }, []);

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
                        {!code && <p className="pt-3">Gdy kod zostanie wykryty, ramka karty zrobi się zielona.</p>}
                        {code && <p className="pt-3">Wykryto kod!<br/><b>{code}</b></p>}
                    </Panel>
                    <div className={'z-50 relative text-center'}>
                        <div className='absolute top-0 left-0 w-full h-full flex flex-col justify-center px-5'>
                            <p className='pb-2'>Aby skorzystać ze skanera, musisz zezwolić na wykorzystanie aparatu.</p>
                            <p>
                                Jeżeli zapytanie o dostęp nie wyświetla się, to twoje urządzenie nie jest
                                kompatybilne lub jego ustawienia odmawiają dostępu do kamery.
                                W takim wypadku wpisz kod ręcznie na ekranie &quot;Szukaj&quot;.
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
                            <video ref={ref} className="w-full"></video>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
