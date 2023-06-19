import { FirebaseApp, getApp, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth, GoogleAuthProvider } from '@firebase/auth';
import { connectFirestoreEmulator, Firestore, getFirestore } from '@firebase/firestore';
import { FirebaseStorage, getStorage } from '@firebase/storage';
import configuration from '@/configuration';
import { connectFunctionsEmulator, getFunctions } from '@firebase/functions';

function createFirebaseApp (config: {}) {
    try {
        return getApp();
    } catch {
        return initializeApp(config);
    }
}

export const firebaseApp: FirebaseApp = createFirebaseApp(configuration.firebase);

export const auth: Auth = getAuth(firebaseApp);
export const googleAuthProvider: GoogleAuthProvider = new GoogleAuthProvider();
export const firestore: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp);

if (configuration.emulator) {
    console.log(configuration.emulatorHost + ':' + configuration.emulatorAuthPort);
    connectAuthEmulator(auth, `http://${configuration.emulatorHost}:${configuration.emulatorAuthPort}`);
    connectFunctionsEmulator(
        functions,
        configuration.emulatorHost as string,
        parseInt(configuration.emulatorFunctionsPort as string, 10)
    );

    // @ts-ignore
    if (!firestore._settingsFrozen) {
        connectFirestoreEmulator(
            firestore,
            configuration.emulatorHost as string,
            parseInt(configuration.emulatorFirestorePort as string, 10)
        );
    }
}
