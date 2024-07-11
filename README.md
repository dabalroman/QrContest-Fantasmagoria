# QrContest23
QrContest23 is an app made for 13'th edition of Fantasmagoria fantasy convention held in Gniezno, Poland (2023).
It's fourth edition of QrContest, previous hence the name is combined with 2023 year.

Previous ones in short:
1. QrContest 2017, ZSEO high school. PHP / MySql / Bootstrap.
2. QrContest 2018, ZSEO high school. PHP / MySql / React / Bootstrap.
3. QrContest 2022, 12'th Fantasmagoria fantasy convention. PHP / Laravel / MySql / React with TS / Mantine.
4. QrContest 2023, 13'th Fantasmagoria fantasy convention. Next.js / React with TS / Firestore / Vercel / Tailwind.
5. QrContest 2024, 14'th Fantasmagoria fantasy convention. Next.js / React with TS / Firestore / Vercel / Tailwind.

# Tech stack
- React with TS
- next.js
- Firestore
- Vercel
- Tailwind CSS
- Content generated using Stable Diffusion / BlueWillow / ChatGPT.

# Run app
```bash
npm run dev
```

## Emulator
```bash
npm install -g firebase-tools
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
## App
```bash
firebase deploy --only hosting,firestore,storage
```

## Functions
```bash
firebase deploy --only functions
```
