import { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

const CODE_REGEX = /^[A-Za-z0-9]{8,10}$/;

export type ScannerStatus = 'ready' | 'denied' | 'no-camera' | 'unknown';
export type ScannerError = Exclude<ScannerStatus, 'ready'>;

// qr-scanner 1.4.2 throws a bare STRING (not an Error) when navigator.mediaDevices is undefined - an
// insecure origin or an ancient browser. Reading .name or testing instanceof Error first mis-handles it.
function classifyScannerError (error: unknown): ScannerError {
    if (typeof error === 'string') {
        return 'no-camera';
    }

    const name = typeof error === 'object' && error !== null && 'name' in error
        ? String((error as { name: unknown }).name)
        : null;

    switch (name) {
        case 'NotAllowedError':
        case 'SecurityError':
            return 'denied';
        case 'NotFoundError':
        case 'OverconstrainedError':
            return 'no-camera';
        default:
            return 'unknown';
    }
}

// allowBareCode is admin-only: a player's scan MUST carry the collect-URL prefix, so a stray convention
// QR can never register as a code. Authoring reads pre-printed sticker sheets, which hold the bare code.
export default function CodeScanner ({
    onCode,
    allowBareCode = false,
    className,
    onStatus
}: {
    onCode: (code: string) => void,
    allowBareCode?: boolean,
    className?: string,
    onStatus?: (status: ScannerStatus) => void
}) {
    const ref = useRef<HTMLVideoElement>(null);
    const handleRef = useRef<(value: string) => void>(() => undefined);
    const statusRef = useRef<((status: ScannerStatus) => void) | undefined>(undefined);

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

        statusRef.current = onStatus;
    });

    useEffect(() => {
        const video = ref.current;

        if (!video) {
            return;
        }

        let cancelled = false;
        const scanner = new QrScanner(
            video,
            (result) => handleRef.current(result.data),
            {
                maxScansPerSecond: 4,
                preferredCamera: 'environment',
                highlightCodeOutline: false,
                highlightScanRegion: false,
                returnDetailedScanResult: true
            }
        );

        scanner.start()
            .then(() => cancelled || statusRef.current?.('ready'))
            .catch((error) => cancelled || statusRef.current?.(classifyScannerError(error)));

        return () => {
            cancelled = true;
            scanner.destroy();
        };
    }, []);

    return <video ref={ref} className={className}></video>;
}
