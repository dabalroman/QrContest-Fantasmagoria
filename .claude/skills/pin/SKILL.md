---
name: pin
description: Write the Polish name + description (and clue) for a Gra Konwentowa map pin, in the house voice of pinsSeed. Use when the user runs /pin with a freeform note about a pin's location, type or riddle - e.g. "/pin pin na korytarzu na dole, obok wielkiego wazonu, zagadka brzmi Groot". Output is copy-paste copy for the map editor, never a file edit.
---

# /pin - authoring pin copy

Input is a freeform Polish note: where the pin is, what type it is, what the riddle answer is,
anything else. Output is **three** name + description options in the chat, ready to paste into the
map-native pin editor. Never write files, never touch the seed, never call a handler.

## Hard rules

- **Polish only.** Every string the player sees is Polish. No English words unless they are the
  actual Polish loanword in use (geocaching, cosplay).
- **Never print the code or the riddle answer** in the name, description or clue. `description` and
  `clue` ship to every client through `PublicPin`; the `code` field is stripped precisely so it stays
  secret. ⚠️ The `Kod: LPA0000001.` and `Odpowiedź: alembik.` suffixes in `pinsSeed.ts.old` were
  development placeholders - do not reproduce them.
- **No em dashes.** Plain hyphen `-` only.
- **Never the word "QrContest".** The game is *Gra Konwentowa*, and even that has no business inside
  a pin's flavour text.
- No emoji, no exclamation marks, no meta-instructions ("zeskanuj kod QR" - the UI already says so).
- Third person, present tense, impersonal. **Second person only** for `photo`, `feedback` and
  instruction-carrying `visit` pins, which need a call to action.

## The name

A noun phrase that renames something mundane into something that belongs in a fantasy world.
1-3 words, Title Case on the meaningful words, no final punctuation, no verbs, ~28 chars max.

> Aula Wielkiego Zjazdu · Korytarz Plakatów · Bufet Szkolny · Portiernia · Studnia Życzeń ·
> Beczka Miodu · Stary Dąb · Wieża Astrologa · Taras Kruka · Lochy Konwentowe · Schowek pod Schodami ·
> Zjawa Drobnego Druku · Stragan Zielarki

A school corridor becomes a *Korytarz*, a basement becomes *Lochy*, the caretaker's desk is a
*Portiernia*, the cloakroom is a *Szatnia Bohaterów*. The joke is the gap between the grand name and
the ordinary thing, so **do not** also make the name jokey - it plays straight, the description
undercuts it.

## The description

1-2 sentences (a ghost may take 3). Roughly 80-180 characters, hard cap ~220. Deadpan: state
something as sober fact, then deflate it. Pick one or two devices, never all of them:

| Device | Example from the seed |
|---|---|
| Grand claim, mundane truth | *Krzesła ustawione w idealnie równe rzędy. Za godzinę nie będzie po tym śladu.* |
| Escalating tricolon | *Menu skromne, kolejka bohaterska, drożdżówki legendarne.* |
| Comic precision with numbers | *Sto ogłoszeń, z czego trzy aktualne.* / *Sto książek na jednym regale. Dziewięćdziesiąt dziewięć z nich wróciło.* |
| One-line undercut | *Wszystko tutaj jest prawdziwe. Prawie wszystko.* |
| Absent authority | *Technicy zapewniają, że tak ma być.* / *Ktoś je nocą liczy i nikt nie wie kto.* |
| Permanent consequence | *Klej, filc i brokat. Brokat zostanie tu już na zawsze.* |
| Story cut short | *Ktoś spisywał tu wszystko. Ostatni wpis urywa się w połowie zdania.* |
| Rule quietly acknowledged | *Dalej jest już tylko dach i regulamin, który tego zabrania.* |

Anchor on a real, checkable detail from the user's note (the vase, the noticeboard, the stairs) -
generic fantasy filler is the failure mode. If the note says a vase is huge, the vase is in the copy.

## Per type

- **code / geocaching** - describe the *place*, not the hunt. The player already knows to look for
  a code. An area hint may be implied ("gdzieś tutaj"), never a precise "pod trzecim krzesłem".
- **riddle** - **the description IS the riddle and carries the hint.** It must hold everything a
  player needs to arrive at the answer, without ever naming it; the answer word must not appear in
  any form, including inflected. When the user gives an answer like `Groot`, the riddle is built
  around what that thing IS, never around its spelling.
  The `clue` field stays **empty by default**. Fill it only for a genuinely hard or non-obvious
  riddle, as a second, narrower pass (a category, a letter count, a first letter) the way *Szklane
  naczynie z długą szyjką (...). Siedem liter, zaczyna się na "a".* does. A clue that merely restates
  the description means the description was underwritten - fix the description instead.
- **visit** - reward the trip. Describe what they are standing in front of.
- **feedback** - two sentences: what the room is, then a direct ask to rate the talk
  (*Powiedz nam, czego tu wysłuchałeś i czy było warto.*).
- **photo** - describe the subject, then ask for the shot as proof
  (*Zrób sobie z nim zdjęcie na dowód, że tu dotarłeś.*).
- **ghost** - the one type with a small backstory. Up to 3 sentences, a death or a fate, and a hint
  that the code is obtained from a person or a place elsewhere. Wry, never gory.

## Output format

Three options, plainly, nothing else. No preamble, no explanation of the choices.

```
**1. Wazon Nieproporcjonalny**
Stoi w korytarzu od zawsze i nikt nie pamięta, kto go tu postawił. Woźny twierdzi, że jest zabytkowy, i tego się trzyma.

**2. Straż Korytarza**
Wysoki, ciężki i ustawiony dokładnie tam, gdzie najłatwiej go potrącić. Do dziś nikomu się nie udało.

**3. Naczynie Zapomniane**
Trzy pokolenia przechodziły obok, nie zwracając na nie uwagi. Wciąż stoi i wciąż czeka.
```

Add `_Wskazówka:_ ...` under an option only when that particular riddle stays hard even with the
description in hand. Most riddles ship without one.
Make the three options genuinely different - three angles on the same place, not one sentence
reworded. If the note is too thin to anchor on (no place, no object), ask one short question instead
of inventing detail.
