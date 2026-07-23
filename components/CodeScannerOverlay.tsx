import { useState } from 'react';
import toast from 'react-hot-toast';
import CodeScanner, { ScannerError, ScannerStatus } from '@/components/CodeScanner';
import Button from '@/components/Button';

const STARTING_MESSAGE = 'Zezwól na dostęp do aparatu.';

const ERROR_MESSAGES: Record<ScannerError, string> = {
    denied: 'Nie ma dostępu do aparatu. Zezwól na dostęp w ustawieniach przeglądarki lub wpisz kod ręcznie.',
    'no-camera': 'Nie znaleziono aparatu w tym urządzeniu. Wpisz kod ręcznie.',
    unknown: 'Nie udało się uruchomić aparatu. Wpisz kod ręcznie.'
};

// z-[60] clears the navbar's z-50 by value rather than by render order, so nothing behind the camera
// stays tappable - the drawer's submit control IS the navbar centre button.
export default function CodeScannerOverlay ({
    onCode,
    onCancel,
    allowBareCode = false
}: {
    onCode: (code: string) => void,
    onCancel: () => void,
    allowBareCode?: boolean
}) {
    const [status, setStatus] = useState<ScannerStatus | null>(null);
    const failed = status !== null && status !== 'ready';
    const message = status === null ? STARTING_MESSAGE : status === 'ready' ? null : ERROR_MESSAGES[status];

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/90 p-4">
            <p className="flex min-h-[3rem] max-w-lg items-center text-center text-text-light">
                {message}
            </p>
            {!failed && (
                <CodeScanner
                    allowBareCode={allowBareCode}
                    className="max-h-[60vh] w-full max-w-lg rounded-2xl object-cover"
                    onStatus={setStatus}
                    onCode={(code) => {
                        onCode(code);
                        toast.success('Kod zeskanowany.');
                    }}
                />
            )}
            <Button type="button" className="w-full max-w-lg" onClick={onCancel}>
                Anuluj
            </Button>
        </div>
    );
}
