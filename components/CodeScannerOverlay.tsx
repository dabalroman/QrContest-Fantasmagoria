import toast from 'react-hot-toast';
import CodeScanner from '@/components/CodeScanner';
import Button from '@/components/Button';

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
    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/90 p-4">
            <p className="max-w-lg text-center text-text-light">
                Aby zeskanować kod, zezwól na dostęp do aparatu. Jeżeli pytanie o dostęp się nie pojawia,
                Twoje urządzenie lub jego ustawienia na to nie pozwalają - wpisz kod ręcznie.
            </p>
            <CodeScanner
                allowBareCode={allowBareCode}
                className="w-full max-w-lg rounded-2xl"
                onCode={(code) => {
                    onCode(code);
                    toast.success('Kod zeskanowany.');
                }}
            />
            <Button type="button" className="w-full max-w-lg" onClick={onCancel}>
                Anuluj
            </Button>
        </div>
    );
}
