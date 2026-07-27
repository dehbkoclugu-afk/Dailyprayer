# A real reminder time picker (roadmap item 17)

Goal: let someone pick any minute of the day, shown in their device's own clock
convention, instead of choosing between three fixed times.

## What was wrong

`openReminderPicker` was a native `Alert` offering 07:30, 12:30, 21:00 and "Turn
off". That is not a time picker, and the labels were hard-coded strings
("Evening · 21:00"), so a reader whose device is on a 12-hour clock was shown
24-hour times the OS would never use.

## Task 1: Separate storage from display

**Files:** `src/lib/time.ts`, `src/lib/time.test.ts`

- [x] **Step 1: Keep storing 24-hour**

  `HH:MM` is unambiguous and sorts, and it is already what `scheduleDailyReminder`
  parses. The display format is a rendering concern, not a storage one.

- [x] **Step 2: Format through Intl**

  `formatTime(value, locale?)` builds a Date and formats with
  `{ hour: 'numeric', minute: '2-digit' }`. Passing no locale uses the runtime
  default, which is what follows the user's 12/24-hour setting. Falls back to the
  stored string if Intl throws, so the row never renders empty.

- [x] **Step 3: Answer which clock the locale reads**

  `prefers24Hour()` resolves `hour12`/`hourCycle`. Android's picker has to be told;
  iOS follows the system setting itself. Defaults to 24-hour when Intl cannot
  answer, matching the stored format rather than guessing 12-hour.

- [x] **Step 4: Unit-test it properly**

  Unlike the source-level guards elsewhere, this is pure and imports nothing
  native, so it is tested for real against Node's ICU: `en-US` gives "7:30 AM" and
  "9:00 PM", `tr-TR`/`de-DE`/`fr-FR` stay on 24-hour with no meridiem, `'none'`
  and malformed values return null rather than parsing as midnight, and a
  malformed locale falls back instead of throwing.

## Task 2: The picker

**Files:** `src/components/ReminderTimeSheet.tsx`, `app/(tabs)/profile.tsx`

- [x] **Step 1: Install the SDK-pinned native module**

  `npx expo install @react-native-community/datetimepicker` → 8.4.1, registered as
  a config plugin.

- [x] **Step 2: Give each platform what it expects**

  Android opens the system clock dialog imperatively via `DateTimePickerAndroid`
  and commits only when `event.type === 'set'`, so dismissing does not set a
  reminder. iOS renders the spinner inline and commits on Save.

- [x] **Step 3: Do not leave a dead sheet anywhere else**

  The native component renders nothing off iOS/Android, which left a sheet with a
  Save button and no control — the same class of dead surface as item 16's
  success message. Other platforms get a typed `HH:MM` field that marks invalid
  input and refuses to save it.

- [x] **Step 4: Wire it up and clean up after it**

  The Profile row opens the sheet, `onPick` feeds the existing `setReminder` (so
  item 16's permission gate still applies) and `onTurnOff` still cancels. The row
  label now goes through `formatTime`. The three fixed-time translation keys were
  deleted in all six languages so nobody wires them back.

## Task 3: Guard it

**Files:** `src/components/reminderPicker.test.ts`

- [x] Nine assertions covering the Alert being gone, the presets and their strings
      being gone, a native picker on both platforms, `is24Hour` being passed,
      dismissal not committing, storage staying 24-hour while display does not,
      turn-off only when a reminder exists, the draft resetting on open, and the
      non-native fallback refusing invalid input.

- [x] **Proved they fail:** hard-coded `is24Hour: false` (caught), removed the
      `event.type !== 'set'` guard (caught), and put the raw stored time back in
      the row (caught).

## Task 4: A release blocker found on the way

`npx expo prebuild` — the first step of the APK workflow — was failing:

```
[android.dangerous]: ENOENT: ./src/assets/art/A17-splash.png
```

`app.json` had **two** `expo-splash-screen` plugin entries. The first pointed at a
PNG that does not exist (the file on disk is `A17-splash.webp`); the second points
at `./assets/splash.png`, which does. The broken duplicate still ran its mod and
crashed, so no APK could be built. This predates this item — it came in with
commit `18e1d0d` — and has nothing to do with the time picker, but it also blocked
verifying the native module just added.

- [x] Removed the broken duplicate entry. `expo prebuild` now finishes.

## Task 5: Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test` (87/87),
      `npm run scripture-check`, `npm run release-gate`, Android Expo export.
- [x] `npx expo prebuild --platform android --no-install` finishes (the generated
      `android/` directory was removed afterwards; it is gitignored).
- [x] Rendered from the web export in two locales with the same stored `21:00`:
      a Turkish device shows `Günlük hatırlatma · 21:00`, an English one shows
      `Daily reminder · 9:00 PM`. The sheet opens with a usable control and no page
      errors.

## Left open

- The A17 splash art is not restored: `expo-splash-screen` needs a PNG and this
  environment has no image converter. Export `A17-splash.webp` to PNG, drop it at
  the path `app.json` expects, and re-add a single plugin entry.
- The native module has not been compiled here — `prebuild` resolves the config
  plugin, but gradle has not run. The APK workflow exercises that.
- The onboarding quiz still offers the three preset times. That is a reasonable
  onboarding simplification rather than a settings control, and Profile can now
  refine it to any minute — but if it should also be free-form, it is a separate
  change.
