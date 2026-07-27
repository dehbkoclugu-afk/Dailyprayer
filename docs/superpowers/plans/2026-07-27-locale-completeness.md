# Six languages, actually (found while verifying roadmap item 24)

Not a roadmap item. Verifying item 24 in the browser showed the guided-prayer
player reading out in English while the app language was Turkish.

## Task 1: Measure before fixing

- [x] Every non-English locale was missing 21 or 22 of English's 323 keys.

| Surface | Keys | Effect |
| --- | --- | --- |
| Player | 12 | every control, the pace label and the subtitle, in five languages |
| Paywall | 6 | processing, restoring, restore-failure copy |
| Notifications | 4 | the daily reminder arrived in English for everyone |
| `bible.credit` | 1 | — (unused, see task 3) |

The concrete consequence worth remembering: **a Turkish user with reminders on got
an English push notification every morning.**

`TranslationKey` is `keyof translations['en']`, so TypeScript only ever checked
that a key exists in *English*. `lookup()` then falls back to English at runtime —
the right behaviour (better English than a blank label) and exactly the wrong
thing to rely on, because the app ships English text with no sign that it has.

## Task 2: Translate the 17 keys that are used

- [x] Five locales × 17 keys. Tone matched to each locale's existing copy: tú in
      Spanish, você in Portuguese, vous in French, du in German, and Turkish's
      existing mix of informal possessive with polite imperative.

## Task 3: Three keys deleted rather than translated

- [x] `player.close`, `player.previous`, `player.next` were English-only
      duplicates of `a11y.closePlayer`, `a11y.prevLine` and `a11y.nextLine` —
      which are already translated into all six languages and were unused. The
      player now uses the ones that exist. Translating the duplicates would have
      created two names for one string in six languages.
- [x] `paywall.thenAnnual`: unreferenced, and it hardcodes `$59.99` in copy. The
      release gate already insists trial length come from the store offer rather
      than a constant; a hardcoded price is the same mistake. Translating it into
      five languages would have spread it.
- [x] `bible.credit`: unreferenced, stale, and a **rights claim inside a UI
      string**, which `docs/scripture-integrity.md` forbids — claims live only in
      `src/data/scriptureRights.ts`. The *English* entry carried the Turkish
      edition's copyright and licence. The live credit comes from
      `getBibleCredit()`, which reads the registry.

## Task 4: "1 resultados"

A counted noun beside a number was always the plural. Four sites; I had just
introduced one of them ("1 min restantes"), so the class got fixed.

- [x] `useT()` returns `tn(count, key)`: where a `<key>.one` entry exists it is
      used for exactly one. Two forms only — all six languages inflect on 1 vs.
      more, and full CLDR plural categories would be machinery for a rule none of
      them needs.
- [x] `search`, `player`, `plan/[id]` and `bible` moved to `tn`. `pray.min` did
      not need it: "min" / "Min." is invariable in all six.

## Task 5: Guard it

**Files:** `src/i18n/completeness.test.ts` — eight rules:

- [x] six locales; every key in every locale; no key English lacks.
- [x] no value left as the English string in another locale — with a 24-character
      floor, because short words are legitimately identical ("Pause", "Amen",
      "Natural").
- [x] no credit line in a translation (`©` or a `CC BY` identifier). Deliberately
      narrower than "any mention of a licensor": the `source.conditions.*` keys
      name eBible.org on purpose — they are the licence obligations translated for
      the reader, which those licences require us to show.
- [x] a `<key>.one` has a plural to pair with, and a counted noun is never read
      with the plain `tr`.
- [x] every key the app asks for exists — the other direction, for a key renamed
      away. The scan asserts it found more than 100 keys so it cannot pass by
      matching nothing.
- [x] **Proved it fails:** deleted a Turkish key (the original bug), left a German
      value in English, put a credit line back, asked for a key that does not
      exist, reverted a call site to `tr`, removed a plural, and removed a
      singular from one locale only. Seven injections, each caught by the rule
      that should catch it.

## Task 6: Verify

- [x] `npm test` (118/118), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, Android export.
- [x] Read back from the browser: the player fully localized in Turkish, German
      and French ("Rehberli metin duası · 1 dk kaldı" / "Geführtes Textgebet ·
      1 Min. übrig" / "Prière guidée en texte · 1 min restante"), and the singular
      taking effect — Spanish "1 min restante" and "1 resultado", with
      "0 resultados" / "0 résultats" staying plural.

## Left open

- The dictionary is one flat object of 321 keys in a 1,900-line file. It works and
  the guard now covers it, but per-locale files would make a missing key visible
  in review rather than only in a test.
- Turkish mixes informal possessive ("yerin") with polite imperative ("yazın").
  Consistent, in that every string follows the same mix, but it is a choice nobody
  wrote down.
