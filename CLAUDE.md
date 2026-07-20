# QrContest — Fantasmagoria

A mobile-first web game played during the **Fantasmagoria** fantasy convention in Gniezno, Poland.
Players hunt printed QR codes hidden around the convention grounds, scan them, collect digital cards,
answer quiz questions, join clubs, and climb a live leaderboard. Runs for ~3 days a year, ~150 players,
100k+ Firestore reads/writes over the event.

**The entire UI is in Polish.** All user-facing strings, toasts, panel titles, and error messages are Polish.
Keep it that way — do not introduce English UI copy.

---

## 1. Stack & versions

| Layer | Tech |
|---|---|
| Frontend | Next.js 13.5 (**pages router**, not app router), React 18, TypeScript 5.8 |
| Styling | Tailwind CSS 3.4 + CSS custom properties in `styles/globals.css` |
| Icons | FontAwesome (`@fortawesome/free-solid-svg-icons`) |
| Forms | `react-hook-form` |
| Toasts | `react-hot-toast` |
| QR scanning | `qr-scanner` (camera-based, client-side) |
| Client SDK | Firebase JS SDK **v9 modular** — imported as `@firebase/auth`, `@firebase/firestore`, … |
| Backend | Firebase Cloud Functions **v2 API** (`firebase-functions` v6), Node **20**, `firebase-admin` 12 |
| Database | Cloud Firestore |
| Auth | Firebase Auth — Google popup + email/password |
| Hosting | Firebase Hosting with `frameworksBackend` (Next.js SSR runs on Cloud Functions) |

Root `package.json` is at version `6.0.0` (the 2025 / 15th-edition release).

### Firebase project facts

- Project id: **`qrcontest2023`** (`.firebaserc`) — the name is historical, it is still the live project.
- Hosting site: **`fantas`** → https://fantas.web.app
- Region: **`europe-west1`** for both functions and the Next.js `frameworksBackend`.
- `setGlobalOptions({region: 'europe-west1'})` is set in `functions/src/index.ts` — every function inherits it.
- The client resolves the callable region from `NEXT_PUBLIC_FIREBASE_REGION`. If those two disagree,
  every callable fails with a CORS/404 — check both when callables mysteriously break.
- Off-season the project runs on the **Spark plan**; Gen-2 callables then return **503**, surfacing in the browser
  as *"CORS header … missing"*. Real cause shows in `npx firebase functions:log` ("billing is disabled"). Fix =
  re-enable **Blaze** (no redeploy). **Check billing before debugging CORS.**

---

## 2. Commands

```bash
# Frontend dev server (binds 0.0.0.0 so a phone on the LAN can reach it)
npm run dev

# Lint / build
npm run lint
npm run build
npx tsc --noEmit                       # fast client-tree typecheck (skips the full Next build)

# Emulators (functions, firestore, auth, storage, pubsub) — imports/exports ./.emulators
npm run emulators

# Cloud Functions MUST be compiled before the emulator picks them up
cd functions && npm run build          # or: npm run build:watch
cd functions && rm -rf lib && npm run build   # REQUIRED after renaming/deleting a source file

# Deploy
firebase deploy --only hosting,firestore,functions
firebase deploy --only functions

# Cloud Functions e2e tests (two terminals)
npm run emulators:test      # hermetic emulator on the demo-qrcontest project
cd functions && npm test    # node:test suite hitting the real callables
```

Gotchas (from `Setup.md`, all real):
- **Functions must be built (`tsc` → `functions/lib/`) before running the emulator.** The emulator loads
  `functions/lib/index.js` (`"main"` in `functions/package.json`), never the TypeScript source.
- **`tsc` never deletes outputs for renamed/removed sources.** Rename `fooHandle.ts` → `barHandle.ts` and
  `lib/fooHandle.js` survives; a running emulator also keeps the dead route registered (it answers `500`)
  until restarted. After any rename: `rm -rf lib && npm run build`, then restart the emulator.
- **`npm run lint` is `next lint` — it does NOT cover `functions/`, and it never linted `.tsx`.** Components
  and the whole backend are effectively checked only by `tsc` and the pre-commit hook.
- **A pre-commit hook runs the full pipeline** (FE typecheck + build, BE lint + build + e2e, ~50s) — see
  `scripts/hooks/pre-commit`. It **fails while a manual emulator is running**, because the e2e leg needs the
  same ports (see §9a).
- Half-baked or weird deploy failures are almost always a stale `firebase-tools` — `npm i -g firebase-tools`.
- Deploy failing with `401` → `firebase login --reauth`.
- **The emulator won't boot until you run `npx firebase experiments:enable webframeworks`** (per-machine, one-time).
  Hosting uses Next.js `frameworksBackend`, so even `--only functions,firestore,…` errors out without it.
- **The Firestore emulator is a JVM app — it needs Java** (`openjdk-21-jre-headless` or similar) or it silently fails to start.
- `firebase` is a **local devDependency**, not global → invoke as **`npx firebase …`**. It starts **unauthenticated**;
  `npx firebase login` is interactive (run it in a real terminal). Emulators run fully offline and need no login.
- Emulator ready signal: `✔ All emulators ready`; UI on `:4000`, hub on `:4400`.

### First-time setup on a bare checkout

`npm install` at the **root and in `functions/`** (two separate trees). Then, before `functions/` will compile:
the real seed files (`functions/src/seeds/*.ts`) must exist — they're **gitignored** (`src/seeds/*.ts`) and shipped
separately in a password-protected zip; only `*.ts.dist` placeholder templates are in git. `seedDatabaseHandle.ts`
imports all six, so `tsc` fails outright without them. `.env.development` is also gitignored — copy `.env.dist` and
set `NEXT_PUBLIC_EMULATOR=true`.

### Environment

Copy `.env.dist` → `.env.development` / `.env.production`. `configuration.ts` is the single place that
reads `process.env`; everything else imports `configuration`. Notable vars:

- `NEXT_PUBLIC_FIREBASE_*` — standard Firebase web config + `NEXT_PUBLIC_FIREBASE_REGION`.
- `NEXT_PUBLIC_EMULATOR=true` — makes `utils/firebase.ts` call `connect*Emulator` for auth/firestore/functions/storage.
- `NEXT_PUBLIC_CODE_COLLECT_URL` — the URL prefix printed into the QR codes (e.g. `https://fantas.web.app/collect/`).
  `pages/scanner.tsx` strips this prefix from the scanned string to recover the raw code. **If this is wrong,
  the scanner silently ignores every valid code.**
- `NEXT_PUBLIC_DASHBOARD_API_URL` — Fantasmagoria's JSON-RPC endpoint the TV dashboard polls for the program.
- `NEXT_PUBLIC_APPCHECK_KEY` / `NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN` — **declared but never used.**
  App Check is not wired into `utils/firebase.ts`. Dead config.

---

## 3. Directory layout

```
pages/            Next.js pages router. Top-level = player screens; auth/ and admin/ are sub-routes.
components/       Shared UI (Panel, Button, LinkButton, Loader, ScreenTitle, Metatags, AuthCheck, Navbar/)
                  plus per-feature folders: collect/, collection/, account/, ranking/, dashboard/, pin/
models/           CLIENT-side domain classes. Extend FirebaseModel, carry Firestore converters.
Enum/             CardTier, UserRole, FireDoc (collection names), Page (routes)
hooks/            useUserData, useCollectedCards, useDynamicNavbar, useTheme, useAdminOnly
utils/            firebase.ts (SDK init), functions.ts (typed callables), context.ts (React contexts),
                  date.ts (Polish pluralization + formatting), getGuildIcon.ts, getPinIcon.ts,
                  randomArrayElement.ts
types/            global.ts — Uid, StringMap
functions/src/    Cloud Functions. Handlers at the root, actions/ for shared transaction helpers,
                  types/ for the ADMIN-side types, seeds/ for the seed data, data/forbiddenPhrases.ts
public/           Static assets: cards/ (64), cards-thumbnails/ (64), cards-reverse/, guilds/,
                  guilds-thumbnails/, clues/, backgrounds/, dashboard/, ico/
styles/globals.css  CSS variables + the guild theme classes
helpers/          XnConvert batch scripts (card → webp / thumbnails) and LLM prompt starters. Not code.
```

---

## 4. The two parallel type worlds ⚠️

This is the single most important architectural quirk. **Every domain concept is defined twice:**

| | Client | Cloud Functions |
|---|---|---|
| Location | `models/*.ts` | `functions/src/types/*.ts` |
| Shape | **Classes** extending `FirebaseModel`, with static `toFirestore` / `fromFirestore` converters | **Plain types** using `firebase-admin/firestore` `Timestamp` / `FieldValue` |
| Dates | `Date` (converted via `.toDate()`) | `Timestamp \| FieldValue` |
| Collections-as-maps | Converted to **arrays** in `fromFirestore` (e.g. `Guild.members`, `RankingRound.users`) | Stay as **maps keyed by uid** |

The client uses `withConverter(Model.getConverter())` on every query so Firestore snapshots come back as
real class instances. `FirebaseModel.toFirestore` throws by default; several models deliberately keep it
throwing (`User`, `Guild`, `Question`, `RankingRound`, `CardClue` all throw *"X is immutable"*), because
**the client is never allowed to write them.** (The editor flags the unused `data` param on these
`toFirestore(data: X)` throwers as TS `[6133]` — spurious; the real `tsc`/build doesn't enforce
`noUnusedParameters`, so match the existing signature, don't "fix" it.)

The two worlds are **not** generated from each other and there is no compile-time link. Some client files
even reach across the boundary and import the admin types directly:

```ts
import { CardTier } from '@/functions/src/types/card';   // models/CardClue.ts, models/CardSet.ts
```

(This works because `tsconfig.json` sets `baseUrl: "."` with `"@/*": ["./*"]`, so `@/` is the repo root.)

**Consequence for any new feature:** adding a field or an entity means editing *both* sides, plus the
Firestore rules, plus the seed. Grep for every enumeration site before declaring done.

---

## 5. Firestore data model

Collection names live in `Enum/FireDoc.ts` — **but that enum is incomplete.** The real set:

| Path | In `FireDoc`? | Written by | Read by |
|---|---|---|---|
| `users/{uid}` | ✅ `USERS` | functions only | owner + admins |
| `users/{uid}/collectedCards/{cardUid}` | ✅ `USERS__COLLECTED_CARDS` | functions only | owner |
| `users/{uid}/collectedPins/{pinUid}` | ✅ `USERS__COLLECTED_PINS` | functions only | owner |
| `users/{uid}/collectedQuestions/collectedQuestions` | ❌ | functions only | **nobody** (no rule → denied) |
| `users-usernames/{username}` | ✅ `USERS_USERNAMES` | functions only | any authed user (uniqueness check) |
| `cards/{cardUid}` | ✅ `CARDS` | functions + **admin `update`** | admins only |
| `pins/{pinUid}` | ✅ `PINS` | functions + seed | **admins only** — the `code` is inline |
| `cardSets/{setUid}` | ✅ `CARD_SET` | seed only | any authed user |
| `clues/{clueUid}` | ✅ `CLUES` | seed only | any authed user |
| `ranking/{roundUid}` | ✅ `RANKING` | functions only | any authed user |
| `guilds/{guildUid}` | ✅ `GUILDS` | functions only | any authed user |
| `achievements/{uid}` | ✅ `ACHIEVEMENTS` | seed + admin console | any authed user — definitions are public |
| `questions/questions` | ❌ | seed only | **nobody** (no rule → denied) |

Two things worth internalising:

1. **`questions` is a single document** (`questions/questions`) holding a map of *all* questions keyed by uid,
   including the `correct` answer. It is unreachable from the client by design — the correct answer never leaves
   the server. `collectedQuestions` is likewise a single doc per user holding a map. Both are deliberately
   absent from `firestore.rules`, and Firestore denies anything not explicitly allowed.
2. **`collectedCards` is a per-user snapshot copy of the card**, not a reference. It duplicates
   `name`/`image`/`description`/`tier`/`value`. That is what the collection screen renders.
   **`collectedPins` does the same for pins** (`name`/`description`/`value`) — and there it is not an
   optimisation but a hard requirement: `pins` is admin-only read, so a snapshot is the *only* way the
   player's client can ever learn what it just found. The snapshot deliberately omits `code` and
   `collectedBy`; `functions/test/pins.test.mjs` asserts it.

### Denormalization / fan-out

Scores are duplicated in four places and kept in sync inside transactions:

```
users/{uid}.score
  → ranking/{round}.users[uid].score      (via actions/updateRanking.ts)
  → guilds/{guild}.members[uid].score     (via actions/updateGuild.ts)
  → guilds/{guild}.score  (recomputed by summing all members, for consistency)
```

`updateRanking` only touches rounds whose `to` is still in the future. `updateGuild` recomputes the guild
aggregate from scratch over all members each time rather than incrementing — deliberately, to self-heal drift.

---

## 6. Security model — **all client writes are denied**

`firestore.rules` grants **`allow write: if false`** on every collection. The only exception is
`cards`, where an **admin** may `update` (that's the in-app card editor at `/admin/edit-card/:code`,
and `Card.toFirestore` correspondingly only serializes `code`, `comment`, `withQuestion`, `isActive`).

Every other mutation goes through an authenticated **callable Cloud Function**. They are declared once in
`utils/functions.ts` as typed `httpsCallable` wrappers:

| Callable | File | What it does |
|---|---|---|
| `setupAccountHandle` | `setupAccountHandle.ts` | Creates the user doc + username reservation + empty `collectedQuestions`. Validates username (3–20 chars, a regex allowlist, and a `forbiddenPhrases` blocklist). |
| `collectCardHandle` | `collectCardHandle.ts` | Validates a 10-char code against `cards` (`isActive == true`), rejects already-collected, optionally draws a random **unanswered** question, writes `collectedCards`, increments score, fans out to ranking + guild. **Cards are retired for 2026** — still deployed, but nothing in the UI calls it (see §12). |
| `collectPinHandle` | `collectPinHandle.ts` | The 2026 replacement for `collectCardHandle` — **fork THIS for any new pin flow.** Two entry paths: `{code}` (global scanner/manual entry, cross-pin lookup filtered to `type == 'code'`) and `{pinUid, answer}` (the map's pin UI, validated against that one pin). Writes `collectedPins` + the pin's `collectedBy`, draws a question, awards via `awardPoints`. Rejects `feedback`/`photo` types. |
| `answerQuestionHandle` | `answerQuestionHandle.ts` | Grades an answer server-side, awards `value` or `0`, fans out. Rejects re-answering. **Shared by cards and pins, unchanged.** |
| `joinGuildHandle` | `joinGuildHandle.ts` | Moves the user between guilds, enforces the **4-hour cooldown**, moves the score contribution from the old guild to the new one. |
| `seedDatabaseHandle` | `seedDatabaseHandle.ts` | Admin-only + **hardcoded password `'4064'`**. Seeds questions, cards, cardSets, ranking rounds, guilds, clues, **pins**, **achievements**. |
| `updateRoundsHandle` | `index.ts` → `updateRoundsProcessor.ts` | Manual "force round update" from the admin panel. |
| `autoUpdateRounds` | `index.ts` | **Scheduled**, cron `0 * * * *` (hourly). Marks finished rounds, stamps the top 3 users with `winnerInRound`. |

**Storage is fully locked down.** `storage.rules` is a blanket `allow read, write: if false;` and nothing in
the app uploads anything today. `getStorage()` is initialized in `utils/firebase.ts` but unused.

### Auth flow

`hooks/useUserData.ts` subscribes to `onSnapshot(users/{authUid})` and exposes
`{ authUser, authLoading, user, userLoading, userReady }` through `UserContext`. `userReady` means
"a Firestore user doc with a username exists" — i.e. account setup is complete.

`components/AuthCheck.tsx` wraps every page in `_app.tsx`. It hard-codes a `publicRoutes` allowlist
(main, login/register + email variants, account-setup, collect, rulebook, faq). Anything else renders
`Custom404` for a signed-out visitor. **`/collect` is intentionally public** so a first-time scanner
lands somewhere sane and gets funneled into registration.

Roles (`Enum/UserRole.ts`): `user`, `admin`, `dashboard`.
- `admin` → unlocks the admin panel in `/account` and the `/admin/*` pages (guarded by `useAdminOnly`).
- `dashboard` → `_app.tsx` force-redirects this role to `/dashboard` and keeps it there. It's the TV/projector
  account, not a player.

---

## 7. Game mechanics

**Cards.** 5 tiers, fixed point values (`Enum/CardTier.ts` — duplicated in `functions/src/types/card.ts`):

| Tier | Points | Polish name |
|---|---|---|
| `common` | 10 | Zwykły |
| `rare` | 15 | Rzadki |
| `epic` | 20 | Epicki |
| `legendary` | 30 | Legendarny |
| `mythical` | 50 | Mityczny |

Card codes are **exactly 10 chars**, `[A-Z0-9]`, uppercased server-side, unique across `cards`,
and gated by `isActive`. The QR code encodes `NEXT_PUBLIC_CODE_COLLECT_URL + code`.

**Questions.** Values `0 | 5 | 10 | 15`. A card with `withQuestion: true` draws a *random question the user has
not seen yet*; the pool is global, not per-card. A wrong answer still burns the question (score 0) and still
increments `amountOfAnsweredQuestions`.

**Card sets** (`cardSets`) group cards for the collection screen and declare how many of each tier they contain,
so the UI can render grey "not yet found" placeholders. The set with `uid === 'secret'` is special-cased in
`components/collection/CardsSetComponent.tsx`: instead of anonymous placeholders it renders **clues**
(`clues` collection) linking to `/clue/:cardId`, each a riddle pointing at a hidden mythical/legendary card.

**Clubs** (called *guilds* in code, *kluby* in the UI — the rename was cosmetic). Four fixed uids:
`guild-desert`, `guild-steel`, `guild-water`, `guild-void`. Purely cosmetic for the player's own chances.
- Guild **power** = `round(score / amountOfMembers)` — the guild leaderboard sorts by power, not raw score,
  so a small club can win.
- Changing clubs has a **4-hour cooldown** (`TIME_BETWEEN_GUILD_CHANGES_MS`, defined **twice**:
  `models/Guild.ts` and `functions/src/joinGuildHandle.ts`).

**Rounds.** `ranking/{uid}` docs with `from`/`to`. Points **carry over** between rounds. The hourly
`autoUpdateRounds` marks a round `finished` and stamps `winnerInRound` on the top 3. A user with
`winnerInRound` set is excluded from later rounds' prizes (but keeps playing to complete the collection).

---

## 8. Frontend conventions

- **Path alias `@/*` → repo root.** Always import as `@/components/...`, `@/models/...`, never relative `../../`.
- **4-space indent, single quotes, semicolons required, `max-len: 120`** (`.eslintrc.json`). Same in `functions/`.
- Long copy blocks (faq, rulebook) opt out with `/* eslint-disable max-len */` at the top of the file.
- **Uids are kebab-case**, generated with `lodash.kebabcase` from the name (see `models/Card.ts` constructor).
- **Reuse-first — don't reinvent.** Fork the nearest existing handler/model and match its idioms rather than
  inventing new patterns; never hand-roll what a shared action already does (route every point award through
  `functions/src/actions/awardPoints.ts`). Keeps the two type worlds + fan-out consistent.

### Routing & rewrites

Pretty URLs are produced by rewrites in `next.config.js` (there are **no** `[param].tsx` files):

```js
/collect/:code        → /collect
/collection/:cardId   → /collection
/clue/:cardId         → /clue
/admin/edit-card/:code → /admin/edit-card
```

The page then reads the value off `router.query`. **Any new dynamic route must be added here**, and its path
constant added to `Enum/Page.ts`.

### Navbar

`components/Navbar/Navbar.tsx` is a fixed bottom bar with **4 side buttons** (Skanuj=`/collect` /
Osiągnięcia=`/achievements` / Ranking / Konto=`/account`) around a large circular **"super button"** in the
**middle** whose icon + action are *per-page*. The super-button's default is **Map** (`Page.MAP` /
`faMapLocationDot`, in `defaultNavbarConfig` + `useDynamicNavbar`'s fallbacks) — so with no override the
centre is the home/map button; pages override it declaratively for contextual actions:

```ts
useDynamicNavbar({ icon: faArrowLeft, onClick: () => router.back() });
```

The config lives in `NavbarConfigContext` and is reset to the Map default on unmount. Flags: `disabled`,
`disabledCenter`, `disabledSides`, `onlyCenter` (used by public/full-screen pages), `animate`,
`animatePointsAdded`. **Only the centre is dynamic — the 4 side tabs are hardcoded with fixed hrefs.** The
grid is `gridTemplateColumns: 'repeat(2, 1fr) 120px repeat(2, 1fr)'` (centre in the middle) — **adding a 5th
tab or making a side tab swappable means changing that + `NavbarConfig`.** The `+points` animation
(`animatePointsAdded`) renders next to the Ranking button. The old Collection/gallery tab was **retired** from
the nav (route + `collectCardHandle` kept, just no tab). Scanning is demoted to the Skanuj tab; the collect
code-entry screen (`LookForCodeView`) keeps the centre on Map and offers scan/confirm as **in-page buttons**,
so the map is always one tap away.

### Caching

`useCollectedCards` fetches `collectedCards`, `cardSets` and `clues` **once** and parks them in
`CardsCacheContext` (wrapped in a trivial `CollectionCache<T>`). It is a plain in-memory cache — a
one-shot `getDocs`, not a live subscription. Invalidate by calling `setCards(null)`; `collect.tsx` does
exactly that after a successful scan so the collection screen refetches.

By contrast, `ranking`, `guilds`, the user doc, and the admin lists all use **live `onSnapshot`**
subscriptions — that's what makes the leaderboard feel instant.

The **pins cache (`usePinsData` → `PinsCacheContext`) is a hybrid**, because the map both collects and
views at once (scanner↔map has no natural invalidation point): `pins` comes from the **`getPins`
callable** (`pins` is admin-only read, so it can't be a client listener without leaking the inline
`code`) with a **15-min poll + tab-focus refetch**, while `collectedPins` is a **live `onSnapshot`** so a
player's own collect greys its marker instantly. There is deliberately **no `setCollectedPins(null)`** —
refetch is freshness/retry only, never coupled to a collect. Mirror `useUserData`, not `useCollectedCards`.
The map registry (`mapId` → area/floor/image/dims) and the coordinate convention (`coords{x,y}` = pixels
from the image top-left, y down; the sole `[-y, x]` swap into Leaflet space) live in `utils/maps.ts`.

### Theming

**The per-club theme switcher was REMOVED (task #32, 2026 edition)** — clubs are hidden, so `Enum/AppTheme.ts`,
`hooks/useTheme.ts` and `ThemeContext` are deleted and `_app.tsx` no longer sets a theme class. The app now
always renders the base palette from `styles/globals.css` `:root` (accent `--color-primary: #9D2F00`). Tailwind
colors (`text-text-accent`, `border-button-border`, …) are still defined **in terms of those CSS variables**.
The `--color-guild-*` tokens + `{bg,border,text,ring}-guild-*` Tailwind colors/safelist stay — the commented-out
guild UI still references them, so re-enabling clubs is a diff-revert of that UI **plus** re-adding the switcher
by hand (theme was deleted, not commented). See §12 and the `CLUBS-DISABLED-2026` markers.

### ⚠️ Tailwind safelist

Class names are built dynamically in several places (`` `border-${guild.uid}` ``, `` `bg-card-${tier}` ``,
`` `bg-pin-${pin.type}` ``). Tailwind cannot see those, so `tailwind.config.js` carries an explicit
**`safelist`** — plain string literals, no patterns — with every `{border,bg,text,ring}-guild-*`,
`-card-*` and `-pin-*` combination.
**Any new dynamically-composed class must be added to that safelist or it will silently not exist in prod.**
Dev looks fine either way — the only honest check is to grep the built CSS:
`npm run build && grep -o '\.bg-pin-code' .next/static/css/*.css`.
Note the prefix asymmetry: `GuildUid` values already embed their prefix (`'guild-desert'`), while `CardTier`
and `PinType` values are bare (`'common'`, `'code'`) — hence `'card-' + tier` / `'pin-' + pin.type`.
Also note `content` only scans `./pages`, `./components`, `./layouts` — classes written in `utils/` or
`models/` are invisible to Tailwind.

---

## 9. Seeding

`functions/src/seeds/*.ts.dist` are **templates checked into git with placeholder data**. The real seeds
(with real codes, real questions, real answers) are gitignored — you must copy `X.ts.dist` → `X.ts` and fill
them before `seedDatabaseHandle` will compile. There's also a `seeds.zip`.

Seeding procedure (from `Setup.md`): register an account → manually flip its `role` to `admin` in the
Firestore console → use *"Seed database"* in the app's profile tab → enter password `4064`.

## 9a. Testing (Cloud Functions, e2e)

Integration/e2e only — no per-function unit tests, no cosmetic/UI assertions. The suite lives in
`functions/test/` (`emulator.mjs` helper, `fixtures.mjs`, `*.test.mjs`), plain ESM + `node:test`, **no new deps**.
Tests mint a real ID token from the Auth emulator and POST to the actual callables, so they exercise real
Firestore transactions and the score fan-out — nothing is mocked.

- Run the emulator with **`npm run emulators:test`** (repo root), which forces the **`demo-qrcontest`** project.
  ⚠️ **A `demo-` project id is mandatory for tests.** Under the real project id (`qrcontest2023`) the admin SDK
  inside each function tries to reach the GCE metadata server for credentials and every in-function Firestore
  call **hangs ~60s then 500s**. The `demo-` id forces full offline mode. (`npm run emulators` keeps the real id
  for manual app testing, since it imports/exports `.emulators` and must match the app config.)
- Then `cd functions && npm test`. The harness resets Firestore+Auth and re-seeds a minimal fixture before each
  test; it does **not** use the real 64-card seed.
- **One-shot alternative:** `scripts/emu-test.sh [cmd...]` wraps `firebase emulators:exec` (demo project, builds
  functions first, waits for ready + tears down, propagates the exit code) — no two-terminal dance. Default cmd =
  the functions suite; pass any command (e.g. `node verify.mjs`). Env: `EMU_ONLY`, `EMU_NO_BUILD`, `EMU_PROJECT`.
- ⚠️ **The suite cannot share ports with a manual `npm run emulators`, and it cannot run against it either** —
  the tests REQUIRE the `demo-` project id (under the real id the in-function admin SDK hangs ~60s then 500s).
  So stop the manual emulator before running the suite **or committing** (the pre-commit hook runs it).
  Stop it with **SIGINT to the `firebase` node process** (the one carrying `--export-on-exit`) and wait for
  `✔ Export complete` — never `pkill` the java children, that loses the `.emulators` dump. ⚠️ Target the
  **node** process (`pgrep -f "bin/firebase emulators:start"`), not the `sh -c` wrapper above it — the
  wrapper does not forward SIGINT, so signalling it looks like it worked and the emulator keeps running.
  The pre-commit hook also runs the FE build, so stop `npm run dev` too or the two contend on `.next`.
- The canonical test asserts the score is identical in all four denormalized places after a collect + answer.
  **Every new point-granting feature must extend this suite** (see the fan-out warning in §12.2).
- Current suite (**31 tests**): `scoring` (card fan-out), `rounds` (`winnerInRound` propagation), `pins`
  (both entry paths, anti-bruteforce, dup guard, availability window, normalization, snapshot/secret-stripping),
  `counters` (legacy docs missing a counter — the §12.2 hydration rule) and `achievements` (threshold crossing +
  4-place fan-out, bonus cascade, exactly-once, response payload, eval-throw, malformed definition).
- `fixtures.mjs` helpers: `seedFixture` (also seeds the achievement definitions — every suite gets them, and
  fixture awards stay under every threshold so the other suites are unaffected), `seedUser(uid, name, overrides)`
  for presetting counters/score/`achievements`, `seedLegacyUser` for the missing-counter case, and
  `seedInvalidAchievements` for the malformed-definition case.

## 10a. Firestore indexes

`firestore.indexes.json` is **empty**. Every current query is single-field or an equality+equality
(`code == X && isActive == true`) that Firestore serves from automatic indexes. A new composite query
will need an index added here.

---

## 10. The TV dashboard

`pages/dashboard.tsx` is a full-screen kiosk view for a projector/TV, gated to `UserRole.DASHBOARD`.
It cycles randomly (weighted) between screen types every 60s — Agenda, Event, splash screens, and a
"Pij wodę!" (drink water) reminder — and re-fetches the convention program hourly from Fantasmagoria's
JSON-RPC API (`NEXT_PUBLIC_DASHBOARD_API_URL`, method `GetKonwent2026Program`). The method is a **hardcoded
literal in `pages/dashboard.tsx`** and **year-stamped** — bump each edition. The URL var must be set in
`.env.production` at build time (`NEXT_PUBLIC_`, inlined) or the fetch silently resolves to `''`.
`AgendaScreen` drops entries longer than 6h (`MAX_AGENDA_ENTRY_DURATION_HOURS`) — permanent all-day booths
that would otherwise flood the scroll list.

Fetch the live program yourself (no app needed):
`curl -s -X POST "$NEXT_PUBLIC_DASHBOARD_API_URL" -H 'content-type: application/json-rpc' -d '{"id":null,"method":"GetKonwent2026Program"}'`
→ `result[]` of `{id, name, title, description, category, location, date_start, date_end}` (UTC dates).

---

## 11. Known cruft / staleness

Things that are wrong-but-harmless today; fix opportunistically, don't be surprised by them:

- `components/Metatags.tsx` still says **"Fantasmagoria 14"** everywhere (title, og, twitter) though the app
  shipped as the 15th edition. It also has a leftover `twitter:site` of `@fireship_dev`.
- `NEXT_PUBLIC_APPCHECK_*` env vars exist but App Check is never initialized.
- `seedDatabaseHandle`'s password `'4064'` is a hardcoded literal in the source.
- `FireDoc` is missing `questions` and `collectedQuestions`; those paths are string literals in the functions.
- `TIME_BETWEEN_GUILD_CHANGES_MS` is defined twice (client + server) and can drift.
- `pages/admin/edit-card.tsx` has a stray `console.log(formState.errors)`.
- `pages/admin/cards.tsx` renders `comment` under the "Nazwa" header and `name` under "Ostatnia osoba" —
  the `<th>` order doesn't match the `<td>` order.
- ✅ **Fixed (task #14): re-seeding used to wipe `collectedBy`.** `seedPins`/`seedCards` used to `.set()`
  with no `{merge: true}`, so re-seeding reset every pin's/card's `collectedBy` to `{}` while
  `users/{uid}/collectedPins|collectedCards` survived — the two would then disagree and the next collect
  surfaced an opaque `ABORTED` (`assertPinIsNotAlreadyCollected` passes, then `transaction.create` hits
  `ALREADY_EXISTS`). ⚠️ **`{merge: true}` alone does NOT fix this**, and never did — a common
  misconception. Firestore's merge does not skip a field just because its value is `{}`; the field being
  *present in the payload at all* means "overwrite this path", so a seed literal carrying
  `collectedBy: {}` still wipes existing finders even under `merge: true`. The actual fix
  (`seedWithPreservedCollectedBy` in `seedDatabaseHandle.ts`) omits the `collectedBy` key from the
  payload entirely for a doc that already exists (merge then leaves that path untouched), and only
  writes an explicit `collectedBy: {}` on first creation. Regression net: `admin-pins.test.mjs`'s
  re-seed test.

---

## 12. Planned expansion (2026 / 16th edition)

Hosting stays on **Firebase**, same as last year. Read this section before planning any of it.

> **The 2026 event goes live around 2026-07-24.** It is a physical convention — the date does not move.
> The app only runs for ~3 days and does 100k+ ops in that window; there is no calm redeploy window
> mid-event. Scope accordingly: fewer features, tested, beats more features, untested.
>
> **Status as of 2026-07-17 — this section is now part plan, part history:**
> - ✅ **12.2 shipped as pins** — the pin model, `collectPinHandle`, the pin visual system and the rewired
>   collect screen are done and manually verified. Cards are retired (handler still deployed, UI orphaned).
> - ✅ **12.1 shipped as the `/map` screen (#13)** — Leaflet `CRS.Simple` over 9 maps, the `getPins`
>   read callable (strips `code` + `collectedBy`), the `hintRadius` field, `usePinsData` (getPins poll +
>   live `collectedPins`), and the per-type pin sheet. `/` stays the public landing.
> - ✅ **12.5 shipped as the navbar/IA rework (#25)** — centre super-button defaults to **Map** (still
>   per-page overridable), side tabs are Skanuj/Osiągnięcia/Ranking/Konto, the Collection tab is retired,
>   signed-in users hitting `/` redirect to `/map`, and the collect screen moves scan/confirm in-page so the
>   centre stays Map. A stub `/achievements` route ships with it; **#24 now depends on that route.**
> - ✅ **12.3 engine shipped as #23** — `achievements` collection (definitions as data), pure type-predicates,
>   auto-grant inside `awardPoints`, `amountOfCorrectAnswers` counter. **#24 (screen) still to build** — it
>   fills the `/achievements` stub and is now pure UI; **#30** (unlock toast) consumes the returned grants.
> - ❌ **12.4 (photo proof) deferred out of v1.** `photo` exists in `PinType` but `collectPinHandle` rejects it.
> - ✅ **Clubs/guilds DROPPED from the UI for 2026 (task #32).** The guild UI is commented out (grep marker
>   `CLUBS-DISABLED-2026`) and the per-club theme switcher deleted. The backend fan-out (`updateGuild`) still
>   runs but is **write-only / unread** by the client — do not build new guild surfaces without re-enabling first.
>
> ⚠️ **The task manager is the live source of truth, not this file.** Task **#9** is the epic/status board
> for the 2026 edition — read it first for current status and the full list of locked decisions.

### 12.0 Non-negotiable design requirement

**All client writes stay denied.** `firestore.rules` remains `allow write: if false` on every collection.
Only Cloud Functions may mutate data, and **anything that awards points must be transactional.**
No new feature may open a client write path to game state. (The one client write surface that *does* open
up is Firebase **Storage**, for photo uploads — see 12.4 — and only under tight constraints.)

### 12.1 Map — becomes the app's main screen

> **✅ SHIPPED (#13).** The `/map` screen, `getPins`, `hintRadius`, `usePinsData` and the pin sheet are
> built. `leaflet`/`@types/leaflet` are now real deps; the 9 placeholder maps live in `public/maps/`
> (#16 overwrites them with real art). The prose below is the design record; decisions 24–31 in task #9
> remain the binding spec.

- **Plain `.webp` images. No GPS, no geolocation, no map SDK in `package.json` today.** GPS was proposed
  again during refinement and **rejected**: it cannot distinguish MOK's floors indoors, and a misfiring
  geofence is unfixable mid-event.
- Shows the area **outside** the convention *and* the buildings.
- ⚠️ **The map set is NINE images, not six — and it is NOT "each building has 3 floors"** (that earlier claim
  was wrong). **Dwór** is a standalone *city* map belonging to no building; **MOK** has 5 levels (Piwnica,
  Parter, Piętro 1, **Piętro 1.5**, Piętro 2); **2LO** has 3 (Parter, Piętro 1, Piętro 2). The registry
  (`mapId` → area, floor label, file, dimensions) lives in `utils/maps.ts`, and the toggle is **peer areas
  + a per-building floor strip** (Dwór shows no strip). Markers are modelled `(mapId, coords{x,y})` — already
  on `Pin` — plus **`hintRadius`**, a new field making a QR marker an *area* hint rather than a precise dot.
- Markers are **RPG-game style** points of interest, not real-world pins.
- Images are static assets → they live in `public/` and are served off Firebase Hosting's CDN, the same way
  the 64 card images already are. Bulk static image serving is a proven path in this repo.
- Pan/zoom/marker hit-testing is custom work. **Decided: Leaflet + `CRS.Simple`** (non-geographic image + markers).
- **The data layer already exists — do not rebuild it.** The `pins` model, its `mapId` + `coords {x,y}` fields
  and `collectPinHandle`'s `{pinUid, answer}` entry path were built for this screen. What the map still owes:
  - a **`getPins` callable** — `pins` is admin-only read, so the client cannot query it. It **must strip both
    `code` (the secret) and `collectedBy` (a uid→username map of every finder: privacy leak + unbounded payload)**
    via an **explicit field whitelist — never `...pinDoc.data()`**. Filters `isActive` **and** the
    `availableFrom/To` window server-side.
  - **reuse `components/pin/PinCardComponent.tsx`** for the pin-click sheet — it is the same card the collect
    screen shows after a scan, deliberately. Reuse `utils/getPinIcon.ts` and the `--color-pin-*` palette too;
    do not invent a second pin colour scheme for markers.
  - a pin cache. `useCollectedCards` / `CardsCacheContext` is **card-only** — there is no pin equivalent yet.
    ⚠️ **Mirror `useUserData` (live), NOT `useCollectedCards` (one-shot):** `collectedPins` gets a live
    `onSnapshot`; only `getPins` is one-shot. The card cache can be one-shot because you collect on `/collect`
    and view on `/collection` — two screens. The map is **both at once**, so scanner→map→scanner has no
    natural invalidation point. A listener is also cheaper than refetching the subcollection per collect.
  - the route: **`/map`** (`Page.MAP`, static — no rewrite). `/` stays the **public landing**; the pin sheet is
    in-map with **no route of its own**.
- Only `code` pins are reachable from `/collect/:code`. **`riddle` / `visit` / `feedback` pins have no other
  entry point than this screen**, so they are untestable until it exists.

### 12.2 Quests / tasks → **SHIPPED as pins**

> ✅ **This section is now history, not a plan.** "Quests" never shipped as a separate entity — they became
> **pins** (`pins/{pinUid}`, `collectPinHandle`, `users/{uid}/collectedPins`). There is no `questHandle`, no
> `amountOfCompletedQuests`. The counter that shipped is **`amountOfCollectedPins`**.
> **Naming rule: pins say `collect`, never `complete`** — pins mirror cards 1:1, and cards are `collected`
> throughout. No `complete*` **identifier** exists anywhere in the source, rules, tests or seeds; the word
> survives only as ordinary English prose in comments and docs. Do not reintroduce one.
> The paragraphs below are kept because the `awardPoints` contract and the counter-hydration rule they
> describe are still exactly right — and they bind every future point-granting feature (achievements, #23).

- **Collecting a pin grants points.** That is the load-bearing sentence.
- ⚠️ Points fan out to **four** places (user doc, every open ranking round, the guild's member entry, the guild
  aggregate). This is now owned by **`functions/src/actions/awardPoints.ts`** —
  `awardPoints(db, tx, userRef, user, points, counters?)` does the user-doc `score`/counter increment, mutates
  the in-memory `user` in place, and fans out to `updateRanking` + `updateGuild` (reading the `ranking`
  collection once and passing the snapshot to both). `collectCardHandle`, `collectPinHandle` and
  `answerQuestionHandle` all go through it; they keep only their domain writes. `counters` is a generic
  `Partial<Record<UserCounterKey, number>>` delta map — `collectPinHandle` passes `{ amountOfCollectedPins: 1 }`.
  `updateRanking(rounds, tx, user)` / `updateGuild(db, rounds, tx, user)` take the pre-fetched rounds snapshot;
  the two non-award callers (`setupAccountHandle`, `joinGuildHandle`) fetch it inline and pass it.
  → **Route every point award through `awardPoints`, do not hand-roll another copy of the fan-out.**
- **User counters are normalized on hydration, not per-award.** A user doc written before a counter existed
  lacks that field, and `getCurrentUser` casts `doc.data() as User` — so the type would otherwise lie.
  `getCurrentUser` spreads `USER_COUNTER_DEFAULTS` (`functions/src/types/user.ts`, next to the `UserCounterKey`
  union) over the doc, which is why `awardPoints` can use a plain `user[key] += …` with no `?? 0` guard.
  Without it, `updateRanking` copies `undefined` into the round and the admin SDK **throws mid-transaction**,
  aborting the whole award. `USER_COUNTER_DEFAULTS` is typed `Record<UserCounterKey, number>`, so a new
  counter without a default is a compile error — add every new counter to the union, `User`, *and* the
  defaults. Regression net: `functions/test/counters.test.mjs` (+ `seedLegacyUser` in `fixtures.mjs`).
- Points are never awarded client-side. The callable that shipped is `functions/src/collectPinHandle.ts`,
  registered in `functions/src/index.ts`, exported through `utils/functions.ts` as `collectPinFunction`.
  Any further pin flow (talk feedback, #12) forks **it**, not `collectCardHandle`.

### 12.3 Achievements — ✅ ENGINE SHIPPED (#23); screen is #24, unlock toast is #30

They **award points**, so granting routes through `awardPoints` like every other point source. The split
that matters: **definitions are DATA, logic is CODE.**

- `achievements/{uid}` is a readable collection (`{name, description, icon, group, type, target, bonus}`),
  seeded from `achievementsSeed.ts` and editable straight in the Firestore console — a threshold can be
  retuned mid-event with no redeploy, which is the whole reason it is data. **The committed seed stays the
  source of truth**; fold any console edit back into it.
- **Logic lives only in `functions/src/achievements/typePredicates.ts`** — `TYPE_COUNTERS`, one counter
  accessor per `AchievementType` (`points` → `score`, `correctAnswers` → `amountOfCorrectAnswers`). Unlock
  is always `counter(user) >= target`, so the unlock and #24's progress bar read the same number.
  **Adding an achievement = one Firestore doc; adding a TYPE = code** (the union makes that compile-enforced).
  Never `switch (uid)`; never let a predicate read Firestore or touch the tx.
- ⚠️ **A bug here must never kill scoring** — it runs inside *every* `awardPoints` transaction, event-wide.
  `evaluateAchievements(user, definitions)` is pure (no writes, does not mutate `user`, returns a grant LIST)
  and is wrapped in try/catch; `applyGrant` — the only writer — runs **outside** the try, which is why a
  mid-loop throw cannot half-apply a grant. Two stable, greppable log prefixes:
  **`ACHIEVEMENTS_EVAL_FAILED`** and **`ACHIEVEMENTS_DEF_INVALID`** (a malformed doc is skipped *and* logged —
  never a silent no-op, since the compiler cannot vouch for a Firestore doc).
- `loadDefinitions` caches for **60s** (0 under `FUNCTIONS_EMULATOR` so e2e reads fresh) and serves
  last-known-good on a failed fetch — scoring never blocks on it.
- **Exactly-once guard = `users/{uid}.achievements[uid] = {grantedAt, bonus}`** — a map on the user doc
  (already loaded per award, already live-synced to the client), not a subcollection. `bonus` records what was
  *actually* awarded, so editing a definition later cannot rewrite history. **There is deliberately no
  `collectedAchievements` clone**: definitions are public, so #24 shows ALL achievements (locked included) by
  joining definitions × that map × live counters. Cards/pins clone only because their source is admin-only-read.
- `awardPoints` returns `AchievementGrant[]`, surfaced by the collect/answer callables as `achievements`.
  ⚠️ It **must be the return value of the `runTransaction` callback** — an outer closure array yields phantom
  grants (and phantom toasts) when Firestore retries a contended tx body.
- `User.fromFirestore` **skips achievement entries it cannot parse** rather than throwing: `useUserData`
  subscribes to that doc, so one malformed entry would otherwise brick the whole app for that player.
- Known accepted risk: a swallowed eval error on a player's *final* award loses that badge — there is no next
  award to self-heal on. Mitigation is visibility (the log prefix), not machinery.

### 12.4 User photo uploads — private quest proof, manually reviewed

- Photos are **proof that a pin was collected.** They are **not** a social feature.
- **Users cannot see other users' uploads.** No public gallery.
- **Review is manual. Explicitly no AI moderation** — the cost would escalate quickly and it is not wanted.
  This implies an **admin review queue** and an approval state on the quest submission.
- Upload from the device **gallery or taken in-app** (camera).
- **`storage.rules` currently denies everything (`allow read, write: if false`).** This is the only place the
  app will ever let a client write directly to Firebase infrastructure. Constrain hard: path-scope to the
  uploader (`/users/{uid}/…`), cap `request.resource.size`, pin `contentType.matches('image/.*')`, and deny
  reads to everyone but the owner and admins.
- `getStorage()` is already initialized and emulator-wired in `utils/firebase.ts`; it's just unused today.

### 12.5 Navigation / IA rework

> **✅ SHIPPED (#25).** The navbar/IA rework is done and committed — see the **§8 Navbar** section for the
> shipped behaviour (Map-default centre, Skanuj/Osiągnięcia/Ranking/Konto side tabs, retired gallery,
> `repeat(2, 1fr) 120px repeat(2, 1fr)` grid, signed-in `/`→`/map` redirect, in-page collect scan/confirm).
> The prose below is the original design record.

The bottom navbar was **full**: 4 side tabs (account / ranking / collection / collect) plus the center
"super button", on a hard-coded `gridTemplateColumns: 'repeat(4, 1fr) 120px'`. The 2026 layout changes:

- **Map becomes the main screen.**
- **The card gallery is replaced by achievements.**
- **Ranking and the user profile stay.**
- **Scanning moves** — it is no longer the primary action.

Cards themselves are not going away; only their navbar slot is. Anything touching `Navbar.tsx` must also
update `Enum/Page.ts` and, for new dynamic routes, the rewrites in `next.config.js`.

### Checklist for adding *any* new entity (map marker, quest, achievement)

1. `Enum/FireDoc.ts` — add the collection name.
2. `firestore.rules` — add a `match` block. **Default to `allow read: if request.auth != null; allow write: if false;`**
   and put the mutation behind a callable. If the client must never see part of the doc (e.g. a quest's answer,
   a marker's solution), keep it in a server-only collection with *no* rule at all, the way `questions` does.
3. `models/<Entity>.ts` — client class + converter (throw in `toFirestore` if immutable).
4. `functions/src/types/<entity>.ts` — admin-side type.
5. `functions/src/seeds/<entity>Seed.ts.dist` + wire it into `seedDatabaseHandle.ts`.
6. `Enum/Page.ts` + `next.config.js` rewrites — if it gets a route.
7. `components/Navbar/Navbar.tsx` — if it gets a tab (mind the hard-coded `repeat(2, 1fr) 120px repeat(2, 1fr)` grid + hardcoded side hrefs).
8. `tailwind.config.js` `safelist` — if it introduces dynamically-built class names.
9. `firestore.indexes.json` — if it needs a composite query.
10. Update `User` in **both** type worlds if it adds a counter, plus `USER_COUNTER_DEFAULTS` (compile-enforced),
    and `RankingRoundUser` / `GuildMember` if that counter should show up on a leaderboard.
11. **Route every point award through the shared transactional `awardPoints` action.** Never hand-roll the fan-out.
12. Extend `functions/test/` — the e2e suite is the only safety net (§9a).

**Worked example:** pins did every step of this. `Enum/FireDoc.ts` (`PINS`, `USERS__COLLECTED_PINS`),
`firestore.rules` (admin-only read, because the `code` is inline), `models/Pin.ts` + `models/CollectedPin.ts`,
`functions/src/types/pin.ts`, `pinsSeed.ts.dist` → `seedDatabaseHandle`, the safelist, the `User` counter +
`USER_COUNTER_DEFAULTS` + `RankingRoundUser`, `awardPoints`, and `functions/test/pins.test.mjs`.
Copy that shape for achievements (#23).
