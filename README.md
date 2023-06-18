# QrContest23
QrContest23 is an app made for 13'th edition of Fantasmagoria fantasy convention held in Gniezno, Poland (2023).
It's fourth edition of QrContest, previous hence the name is combined with 2023 year.
Previous ones in short:
1. QrContest 2017, ZSEO high school. PHP / MySql / Bootstrap.
2. QrContest 2018, ZSEO high school. PHP / MySql / React / Bootstrap.
3. QrContest 2022, 12'th Fantasmagoria fantasy convention. PHP / Laravel / MySql / React with TS / Mantine.
4. QrContest 2023, 13'th Fantasmagoria fantasy convention. Next.js / React with TS / Firestore / Vercel / Tailwind.

# Tech stack
- React with TS
- next.js
- Firestore
- Vercel
- Tailwind CSS
- Content generated using Stable Diffusion / BlueWillow / ChatGPT.

# TODO - Requirements
## Critical
- [ ] Auth
  - [ ] Register new user account
  - [ ] Log in
  - [ ] Providers
    - [x] Google
    - [ ] Email
- [ ] Sections
  - [ ] Navbar for each section 
  - [x] Codes
  - [x] My collection
  - [x] Rankings
  - [x] User account
- [ ] Codes 
  - [ ] Collect code via QR scan (external apps, collect url)
    - One code can be collected only once
  - [x] Collect code via input on app main screen (enter code manually)
    - Prevent spam, one code every 5 seconds on failure
  - [x] Acquire points on code collection
  - [ ] Closed questions on some codes
    - 4 possible answers
    - Random but unique (cannot repeat for given user)
    - Each worth different amount of points based on difficulty rating
  - [ ] Collectable cards on each code
    - Ai generated images
    - Name of a code and acquired points on card screen
- [ ] My collection
  - [x] List of collected codes
- [x] Rankings
  - [x] View user score
  - [x] View ranking (all users, yourself)
- [ ] User account
  - [ ] Notifications section
  - [ ] Contest status messages
  - [ ] Log out
- [ ] Codes management (**Admin**)
  - [ ] Generate codes
    - Code without vowels to avoid words generation
    - Create printable qr codes from already generated ones
    - All created codes are not collectable
  - [ ] Activate code
  - [ ] Save code metadata - name, description, difficulty, points
- [ ] Users management (**Admin**)
  - [ ] Users list
  - [ ] Block user
- [ ] Contest management (**Admin**)
  - [ ] Set round start/end datetime
  - [ ] Edit status messages
- [ ] Other
  - [ ] Terms of service and rulebook

## Nice-to-have
- [ ] Auth
  - [ ] Anonymous provider (?)
- [ ] User account
  - [ ] Pick house (and show in rankings)
    - User can pick one of 4 houses
    - Pick on registration screen and in user settings
    - Each house is shown on rankings
  - [ ] Push notifications
  - [ ] Delete account
- [ ] Codes
  - [ ] Built-in qr scanner
- [ ] My collection
  - [ ] Cards collections
    - Visible in cards gallery as separate rows
  - [ ] Cards gallery
    - All acquired cards shown as list
    - Not acquired ones shown as grayed out, backside only
  - [ ] Stats of card rarity/popularity
- [ ] Visuals
  - [ ] Magic map with random users
    - [ ] Login screen
    - [ ] TV Dashboard
  - [ ] Card reveal animation
- [ ] TV dashboard
  - [ ] Ranking (top 10)
  - [ ] Org's messages
    - Big fullscreen text on mono-color background or magic map
  - [ ] Scheduler - nearest events
    - Nearest events in form of timeline
  - [ ] Cards showcase
    - Show a card with stats on collections, rarity
- [ ] Messages/scheduler management (**Admin**)
  - [ ] Create, edit and delete org's messages
  - [ ] Create, edit and delete events in scheduler
