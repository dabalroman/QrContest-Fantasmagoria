import { getStorage } from 'firebase-admin/storage';

// One object per (player, pin). Overwriting this single path accumulates nothing, which is what makes
// "upload lots of data" impossible under the narrow storage.rules (#19). storage.rules matches exactly
// this shape: /users/{uid}/photos/{pinUid}.
export function photoStoragePath(userUid: string, pinUid: string): string {
    return `users/${userUid}/photos/${pinUid}`;
}

// index.ts calls admin.initializeApp() with no args, so there is no default bucket configured on the
// app. In the Cloud Functions runtime FIREBASE_CONFIG carries the real storageBucket; under the
// emulator it is the demo project's default. Resolve it explicitly rather than relying on bucket().
function bucketName(): string {
    const config = process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : {};
    return config.storageBucket || `${process.env.GCLOUD_PROJECT}.appspot.com`;
}

export function photoBucket(): ReturnType<ReturnType<typeof getStorage>['bucket']> {
    return getStorage().bucket(bucketName());
}

// Builds a Firebase download-token URL from an object's `firebaseStorageDownloadTokens` metadata (which
// the client's uploadBytes auto-creates) - no getSignedUrl, so no IAM signBlob grant and it works
// against the Storage emulator. Under the emulator the host is the emulator's, not googleapis.com.
export function photoDownloadUrl(storagePath: string, token: string): string {
    const emulatorHost = process.env.STORAGE_EMULATOR_HOST || process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    const base = emulatorHost
        ? `${emulatorHost.startsWith('http') ? emulatorHost : `http://${emulatorHost}`}/v0/b/${bucketName()}/o`
        : `https://firebasestorage.googleapis.com/v0/b/${bucketName()}/o`;

    return `${base}/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}
