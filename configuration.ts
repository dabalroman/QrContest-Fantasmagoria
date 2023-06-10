const configuration = {
    firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
    emulatorHost: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST,
    emulatorAuthPort: process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT,
    emulatorFirestorePort: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT,
    emulatorFunctionsPort: process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT,
    emulator: process.env.NEXT_PUBLIC_EMULATOR === 'true',
};

export default configuration;
