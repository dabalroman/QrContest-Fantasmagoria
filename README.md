# QrContest
QrContest is an app made for 15'th edition of Fantasmagoria fantasy convention held in Gniezno, Poland (2025).
It's sixth edition of QrContest.

Previous ones in short:
1. QrContest 2025, 15'th Fantasmagoria fantasy convention. Next.js / React with TS / Firestore / Vercel / Tailwind.
2. QrContest 2024, 14'th Fantasmagoria fantasy convention. Next.js / React with TS / Firestore / Vercel / Tailwind.
3. QrContest 2023, 13'th Fantasmagoria fantasy convention. Next.js / React with TS / Firestore / Vercel / Tailwind.
4. QrContest 2022, 12'th Fantasmagoria fantasy convention. PHP / Laravel / MySql / React with TS / Mantine.
5. QrContest 2018, ZSEO high school. PHP / MySql / React / Bootstrap.
6. QrContest 2017, ZSEO high school. PHP / MySql / Bootstrap.

# Tech stack
- React with TS
- next.js
- Firestore
- Vercel
- Tailwind CSS
- Content generated using Stable Diffusion / BlueWillow / ChatGPT.


# Configuration
## Local
Copy `.env.dist` to `.env.development` and fill out the values using data from firebase console.

## Production
Copy `.env.dist` to `.env.production` and fill out the values using data from firebase console.

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

# Deployment to Firebase
## Install firebase-tools
```bash
npm install -g firebase-tools
```

## App
```bash
firebase deploy --only hosting,firestore
```

## Functions
```bash
firebase deploy --only functions
```

# Debugging
If deploy fails in weird ways (half-baked deploys, broken app, connection errors on prod), double check if the firebase-tools are up-to-date.
```bash
npm install -g firebase-tools
```

If deploy fails with `401` code, try to log in to firebase again.
```bash
firebase login --reauth
```
