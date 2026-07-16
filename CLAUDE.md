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
                  plus per-feature folders: collect/, collection/, account/, ranking/, dashboard/
models/           CLIENT-side domain classes. Extend FirebaseModel, carry Firestore converters.
Enum/             CardTier, UserRole, FireDoc (collection names), Page (routes), AppTheme
hooks/            useUserData, useCollectedCards, useDynamicNavbar, useTheme, useAdminOnly
utils/            firebase.ts (SDK init), functions.ts (typed callables), context.ts (React contexts),
                  date.ts (Polish pluralization + formatting), getGuildIcon.ts, randomArrayElement.ts
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
| `users/{uid}/collectedQuestions/collectedQuestions` | ❌ | functions only | **nobody** (no rule → denied) |
| `users-usernames/{username}` | ✅ `USERS_USERNAMES` | functions only | any authed user (uniqueness check) |
| `cards/{cardUid}` | ✅ `CARDS` | functions + **admin `update`** | admins only |
| `cardSets/{setUid}` | ✅ `CARD_SET` | seed only | any authed user |
| `clues/{clueUid}` | ✅ `CLUES` | seed only | any authed user |
| `ranking/{roundUid}` | ✅ `RANKING` | functions only | any authed user |
| `guilds/{guildUid}` | ✅ `GUILDS` | functions only | any authed user |
| `questions/questions` | ❌ | seed only | **nobody** (no rule → denied) |

Two things worth internalising:

1. **`questions` is a single document** (`questions/questions`) holding a map of *all* questions keyed by uid,
   including the `correct` answer. It is unreachable from the client by design — the correct answer never leaves
   the server. `collectedQuestions` is likewise a single doc per user holding a map. Both are deliberately
   absent from `firestore.rules`, and Firestore denies anything not explicitly allowed.
2. **`collectedCards` is a per-user snapshot copy of the card**, not a reference. It duplicates
   `name`/`image`/`description`/`tier`/`value`. That is what the collection screen renders.

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
| `collectCardHandle` | `collectCardHandle.ts` | Validates a 10-char code against `cards` (`isActive == true`), rejects already-collected, optionally draws a random **unanswered** question, writes `collectedCards`, increments score, fans out to ranking + guild. |
| `answerQuestionHandle` | `answerQuestionHandle.ts` | Grades an answer server-side, awards `value` or `0`, fans out. Rejects re-answering. |
| `joinGuildHandle` | `joinGuildHandle.ts` | Moves the user between guilds, enforces the **4-hour cooldown**, moves the score contribution from the old guild to the new one. |
| `seedDatabaseHandle` | `seedDatabaseHandle.ts` | Admin-only + **hardcoded password `'4064'`**. Seeds questions, cards, cardSets, ranking rounds, guilds, clues. |
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

`components/Navbar/Navbar.tsx` is a fixed bottom bar with **4 side buttons** (account / ranking / collection /
collect) plus a large circular **"super button"** in the middle whose icon + action are *per-page*. Pages
configure it declaratively:

```ts
useDynamicNavbar({ icon: faArrowLeft, onClick: () => router.back() });
```

The config lives in `NavbarConfigContext` and is reset on unmount. Flags: `disabled`, `disabledCenter`,
`disabledSides`, `onlyCenter` (used by public/full-screen pages), `animate`, `animatePointsAdded`.
The grid is hard-coded `gridTemplateColumns: 'repeat(4, 1fr) 120px'` — **adding a 5th tab means changing that.**

### Caching

`useCollectedCards` fetches `collectedCards`, `cardSets` and `clues` **once** and parks them in
`CardsCacheContext` (wrapped in a trivial `CollectionCache<T>`). It is a plain in-memory cache — a
one-shot `getDocs`, not a live subscription. Invalidate by calling `setCards(null)`; `collect.tsx` does
exactly that after a successful scan so the collection screen refetches.

By contrast, `ranking`, `guilds`, the user doc, and the admin lists all use **live `onSnapshot`**
subscriptions — that's what makes the leaderboard feel instant.

### Theming

`Enum/AppTheme.ts` maps a `GuildUid` → a theme class (`theme-desert`, `theme-steel`, `theme-void`,
`theme-water`, `theme-default`). `_app.tsx` puts that class on the root `<div>`; `styles/globals.css` then
overrides `--color-primary` for that subtree. Tailwind colors (`text-text-accent`, `border-button-border`, …)
are all defined **in terms of those CSS variables**, so the whole app recolors to the player's club.

### ⚠️ Tailwind safelist

Class names are built dynamically in several places (`` `border-${guild.uid}` ``, `` `bg-card-${tier}` ``).
Tailwind cannot see those, so `tailwind.config.js` carries an explicit **`safelist`** with every
`{border,bg,text,ring}-guild-*` and `{border,bg,text,ring}-card-*` combination.
**Any new dynamically-composed class must be added to that safelist or it will silently not exist in prod.**
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
- The canonical test asserts the score is identical in all four denormalized places after a collect + answer.
  **Every new point-granting feature must extend this suite** (see the fan-out warning in §12.2).

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

---

## 12. Planned expansion (2026 / 16th edition)

Hosting stays on **Firebase**, same as last year. Read this section before planning any of it.

> **The 2026 event goes live around 2026-07-24.** It is a physical convention — the date does not move.
> The app only runs for ~3 days and does 100k+ ops in that window; there is no calm redeploy window
> mid-event. Scope accordingly: fewer features, tested, beats more features, untested.
>
> **Not everything below will ship.** The details of quests and achievements are still subject to a
> brainstorming session. The map, the IA rework, and the photo-proof flow are decided.

### 12.0 Non-negotiable design requirement

**All client writes stay denied.** `firestore.rules` remains `allow write: if false` on every collection.
Only Cloud Functions may mutate data, and **anything that awards points must be transactional.**
No new feature may open a client write path to game state. (The one client write surface that *does* open
up is Firebase **Storage**, for photo uploads — see 12.4 — and only under tight constraints.)

### 12.1 Map — becomes the app's main screen

- **Plain `.webp` images. No GPS, no geolocation, no map SDK in `package.json` today.**
- Shows the area **outside** the convention *and* the buildings.
- Needs: **scroll, zoom, waypoints/markers, and a floor toggle — each building has 3 floors.**
  The floor toggle means the map is not one image but a set, switched between; plan the marker model
  around a `(building, floor)` or layer coordinate, not just an `(x, y)`.
- Markers are **RPG-game style** points of interest, not real-world pins.
- Images are static assets → they live in `public/` and are served off Firebase Hosting's CDN, the same way
  the 64 card images already are. Bulk static image serving is a proven path in this repo.
- Pan/zoom/marker hit-testing is custom work. Decide early whether to hand-roll it (CSS transforms) or take
  a dependency — Leaflet with `CRS.Simple` is designed for exactly this (tiled non-geographic image + markers).

### 12.2 Quests / tasks

- **Completing a quest grants points.** That is the load-bearing sentence.
- ⚠️ Points fan out to **four** places (user doc, every open ranking round, the guild's member entry, the guild
  aggregate). This is now owned by **`functions/src/actions/awardPoints.ts`** —
  `awardPoints(db, tx, userRef, user, points, counters?)` does the user-doc `score`/counter increment, mutates
  the in-memory `user` in place, and fans out to `updateRanking` + `updateGuild` (reading the `ranking`
  collection once and passing the snapshot to both). `collectCardHandle` and `answerQuestionHandle` both go
  through it; they keep only their domain writes. `counters` is a generic `Partial<Record<UserCounterKey, number>>`
  delta map — quests pass `{ amountOfCompletedQuests: 1 }` once that field is added to `User` (see #4).
  `updateRanking(rounds, tx, user)` / `updateGuild(db, rounds, tx, user)` take the pre-fetched rounds snapshot;
  the two non-award callers (`setupAccountHandle`, `joinGuildHandle`) fetch it inline and pass it.
  → **Route quests through `awardPoints`, do not hand-roll a third copy of the fan-out.**
- **User counters are normalized on hydration, not per-award.** A user doc written before a counter existed
  lacks that field, and `getCurrentUser` casts `doc.data() as User` — so the type would otherwise lie.
  `getCurrentUser` spreads `USER_COUNTER_DEFAULTS` (`functions/src/types/user.ts`, next to the `UserCounterKey`
  union) over the doc, which is why `awardPoints` can use a plain `user[key] += …` with no `?? 0` guard.
  Without it, `updateRanking` copies `undefined` into the round and the admin SDK **throws mid-transaction**,
  aborting the whole award. `USER_COUNTER_DEFAULTS` is typed `Record<UserCounterKey, number>`, so a new
  counter without a default is a compile error — add every new counter to the union, `User`, *and* the
  defaults. Regression net: `functions/test/counters.test.mjs` (+ `seedLegacyUser` in `fixtures.mjs`).
- Points are never awarded client-side. New callable → `functions/src/completeQuestHandle.ts` (or similar),
  registered in `functions/src/index.ts`, exported through `utils/functions.ts`.

### 12.3 Achievements — replace the card gallery

- Achievements take over the **gallery/collection** slot in the navigation (see 12.5).
- If they only award badges, they can be a pure read model derived from counters already on the user doc
  (`score`, `amountOfCollectedCards`, `amountOfAnsweredQuestions`, + a new quest counter) — no new collection,
  no new callable, no new failure mode.
- If they award **points**, they become another writer into the fan-out above and must go through the same
  transactional action. Decide which before planning; the two are wildly different scopes.

### 12.4 User photo uploads — private quest proof, manually reviewed

- Photos are **proof that a quest was completed.** They are **not** a social feature.
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

The bottom navbar is **full**: 4 side tabs (account / ranking / collection / collect) plus the center
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
7. `components/Navbar/Navbar.tsx` — if it gets a tab (mind the hard-coded 4-column grid).
8. `tailwind.config.js` `safelist` — if it introduces dynamically-built class names.
9. `firestore.indexes.json` — if it needs a composite query.
10. Update `User` in **both** type worlds if it adds a counter, plus `USER_COUNTER_DEFAULTS` (compile-enforced),
    and `RankingRoundUser` / `GuildMember` if that counter should show up on a leaderboard.
11. **Route every point award through the shared transactional `awardPoints` action.** Never hand-roll the fan-out.

### Checklist for adding *any* new entity (map marker, quest, achievement)

1. `Enum/FireDoc.ts` — add the collection name.
2. `firestore.rules` — add a `match` block. **Default to `allow read: if request.auth != null; allow write: if false;`**
   and put the mutation behind a callable. If the client must never see part of the doc (e.g. a quest's answer,
   a marker's solution), keep it in a server-only collection with *no* rule at all, the way `questions` does.
3. `models/<Entity>.ts` — client class + converter (throw in `toFirestore` if immutable).
4. `functions/src/types/<entity>.ts` — admin-side type.
5. `functions/src/seeds/<entity>Seed.ts.dist` + wire it into `seedDatabaseHandle.ts`.
6. `Enum/Page.ts` + `next.config.js` rewrites — if it gets a route.
7. `components/Navbar/Navbar.tsx` — if it gets a tab (mind the hard-coded 4-column grid).
8. `tailwind.config.js` `safelist` — if it introduces dynamically-built class names.
9. `firestore.indexes.json` — if it needs a composite query.
10. Update `User` in **both** type worlds if it adds a counter, plus `USER_COUNTER_DEFAULTS` (compile-enforced),
    and `RankingRoundUser` / `GuildMember` if that counter should show up on a leaderboard.
