// Client-side image downscale for photo-proof pins (#19). Loads the picked/taken file into an <img>,
// draws it onto a <canvas> capped at `maxEdge` on the longest side, and re-encodes as JPEG - so the
// blob that reaches Storage is typically <1MB regardless of the phone's raw resolution. No dependency;
// this is why the narrow owner-only Storage bucket can never accumulate real data.
export default function downscaleImage (
    file: File,
    maxEdge: number = 2048,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);

            const longest = Math.max(image.width, image.height);
            const scale = longest > maxEdge ? maxEdge / longest : 1;
            const width = Math.round(image.width * scale);
            const height = Math.round(image.height * scale);

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            if (!context) {
                reject(new Error('Nie udało się przetworzyć zdjęcia.'));
                return;
            }

            context.drawImage(image, 0, 0, width, height);
            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('Nie udało się przetworzyć zdjęcia.')),
                'image/jpeg',
                quality
            );
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Nie udało się wczytać zdjęcia.'));
        };

        image.src = url;
    });
}
