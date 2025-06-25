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

## Tech stack
- React with TS
- next.js
- Firestore
- Vercel
- Tailwind CSS

## 2025 Edition TODO:
- [ ] Create new lore - story and cards
- [ ] Create images for new lore
- [ ] Create 80 QR codes
- [ ] New UI skin
- [ ] Update questions list
- [ ] Seed the hidden category of cards
- [ ] Update the dashboard to use new api
- [ ] Prepare posters
- [ ] Prepare splash screen for dashboard
- [ ] Fix ranking bug for second round
- [ ] Cleanup production database
- [ ] Production release
- [ ] Create nice readme

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

## Deployment to Firebase
### Install firebase-tools
```bash
npm install -g firebase-tools
```

```bash
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

# Git-crypt (Seed Files Encryption)
The `functions/src/seeds/` folder is encrypted with **git-crypt**. On a new machine, perform these steps to decrypt and work with the seed files:

## Install git-crypt and GPG**
```bash
sudo apt update
sudo apt install git-crypt gnupg
```

## Import GPG key
Obtain ASCII-armored key files (`mykey.pub.asc` and `mykey.sec.asc`) from the project maintainer, then run:
```bash
gpg --import mykey.pub.asc
gpg --import mykey.sec.asc
```
