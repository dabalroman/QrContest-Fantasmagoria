import { ChangeEvent, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ref, uploadBytes } from '@firebase/storage';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faCheck, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { auth, storage } from '@/utils/firebase';
import { submitPhotoFunction } from '@/utils/functions';
import downscaleImage from '@/utils/downscaleImage';
import Button, { ButtonState } from '@/components/Button';
import SheetSection from '@/components/map/SheetSection';

// Imperative handle so the PinSheet's centre super-button can open the OS Camera/Gallery chooser — the
// same action as the in-panel upload button (the picker lives here, next to the preview/upload state).
export interface PhotoPinCollectHandle {
    openPicker: () => void;
}

// The capture UX for a `photo`-type pin (#19), rendered inside the map's PinSheet. The phone does the
// hard work: `<input accept="image/*">` (no `capture`) opens the OS Camera/Gallery chooser — the native
// camera gives front/back flip + focus/flash for free. The picked shot previews in-app with a
// Zatwierdź / Wybierz inne confirm; only on confirm is it downscaled (canvas, ≤2048px q0.8) and uploaded
// straight to Storage, then submitPhotoFunction marks the pin pending. Any error leaves NO partial
// state (greying is written only after submitPhotoHandle commits) — the retry overwrites the same object.
const PhotoPinCollect = forwardRef<PhotoPinCollectHandle, {
    pinUid: string,
    onSubmitted: () => void
}>(function PhotoPinCollect ({ pinUid, onSubmitted }, handleRef) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    useImperativeHandle(handleRef, () => ({
        openPicker: () => inputRef.current?.click()
    }), []);

    const reset = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0] ?? null;
        if (!selected) {
            return;
        }
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
    };

    const confirm = async () => {
        const uid = auth.currentUser?.uid;
        if (!file || !uid) {
            return;
        }

        setUploading(true);
        try {
            const blob = await downscaleImage(file);
            await uploadBytes(
                ref(storage, `users/${uid}/photos/${pinUid}`),
                blob,
                { contentType: 'image/jpeg' }
            );
            await submitPhotoFunction({ pinUid });

            toast.success('Zdjęcie wysłane do weryfikacji');
            reset();
            onSubmitted();
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się wysłać zdjęcia. Spróbuj ponownie.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <SheetSection title="Zrób zdjęcie" loading={uploading}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
            />

            {!previewUrl &&
                <div className="text-center">
                    <p className="font-semibold mb-3">Zrób zdjęcie, aby zaliczyć to miejsce.</p>
                    <Button onClick={() => inputRef.current?.click()} className="w-full">
                        <FontAwesomeIcon icon={faCamera}/> Zrób / wybierz zdjęcie
                    </Button>
                </div>
            }

            {previewUrl &&
                <div className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewUrl}
                        alt="Podgląd zdjęcia"
                        className="rounded-xl mx-auto max-h-64 object-contain"
                    />
                    <p className="mt-3 mb-3 font-semibold">Czy to właściwe zdjęcie?</p>
                    <div className="flex gap-2">
                        <Button
                            onClick={confirm}
                            className="w-full"
                            state={uploading ? ButtonState.DISABLED : ButtonState.ENABLED}
                        >
                            <FontAwesomeIcon icon={faCheck}/> Zatwierdź
                        </Button>
                        <Button
                            onClick={reset}
                            className="w-full"
                            state={uploading ? ButtonState.DISABLED : ButtonState.ENABLED}
                        >
                            <FontAwesomeIcon icon={faRotateLeft}/> Wybierz inne
                        </Button>
                    </div>
                </div>
            }
        </SheetSection>
    );
});

export default PhotoPinCollect;
