import { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

const CODE_REGEX = /^[A-Za-z0-9]{8,10}$/;

// allowBareCode is admin-only: a player's scan MUST carry the collect-URL prefix, so a stray convention
// QR can never register as a code. Authoring reads pre-printed sticker sheets, which hold the bare code.
export default function CodeScanner ({
    onCode,
    allowBareCode = false,
    className
}: {
    onCode: (code: string) => void,
    allowBareCode?: boolean,
    className?: string
}) {
    const ref = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);
    const handleRef = useRef<(value: string) => void>(() => undefined);

    useEffect(() => {
        handleRef.current = (value: string) => {
            const collectUrl: string = process.env.NEXT_PUBLIC_CODE_COLLECT_URL ?? 'env-not-found';

            if (value.includes(collectUrl)) {
                value = value.replace(collectUrl, '');
            } else if (!allowBareCode) {
                return;
            }

            if (CODE_REGEX.test(value)) {
                onCode(value);
            }
        };
    });

    useEffect(() => {
        let init = false;

        qrScannerRef.current = ref.current ? new QrScanner(
            ref.current,
            (result) => handleRef.current(result.data),
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

    return <video ref={ref} className={className}></video>;
}
