# Configuration
- For local, copy `.env.dist` to `.env.development` and fill out the values using data from firebase console.
- For production, copy `.env.dist` to `.env.production` and fill out the values using data from firebase console.

# Run app
First fill out the `.env.development` file from `.env.example`.

```bash
npm install
npm run dev
```

## Emulator
```bash
npm install --g firebase-tools
npm run emulators
```

## Functions
Remember to build functions before use in emulator.
```bash
# /functions
npm run build
npm run build:watch
```

## Seed the db
Create an account in the database.
Go to the firestore's account record and set its role to `admin`.
Use `seed db` option in the user profile tab in the app.

## Deployment to Firebase
### Install firebase-tools
```bash
npm install -g firebase-tools
```

```bash
firebase deploy --only hosting,firestore,functions
firebase deploy --only hosting,firestore
firebase deploy --only functions
```

## Debugging
If deploy fails in weird ways (half-baked deploys, broken app, connection errors on prod), double check if the firebase-tools are up-to-date.
```bash
npm install -g firebase-tools
```

If deploy fails with `401` code, try to log in to firebase again.
```bash
firebase login --reauth
```