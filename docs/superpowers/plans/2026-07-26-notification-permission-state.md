# Honest notification permission state (roadmap item 16)

Goal: stop telling people a reminder was set when it was not, and give the Profile
row a real state plus a way out.

## What was wrong

`setReminder` in `app/(tabs)/profile.tsx`:

```
setQuiz({ prayerTime: time ?? 'none' });
if (time) { requestPermission().then(granted => { if (granted) schedule… }) }
toast(translate('toast.reminderSet'));   // ← unconditional, and before the answer
```

Three separate untruths came out of that:

1. The success toast fired regardless of the permission result, and in fact before
   it resolved. A user who had blocked notifications was told a reminder existed.
2. The row read `Daily reminder · 07:30` from the stored time alone, so it kept
   claiming a reminder while the OS was blocking every one of them.
3. Choosing "Off" wrote `prayerTime: 'none'` but **never cancelled the schedule**,
   so notifications kept arriving while the row said Off — the same class of
   untruth pointing the other way.

## Task 1: Give the service a real answer to give

**Files:** `src/services/notifications.ts`

- [x] **Step 1: Three states, not a boolean**

  `granted` / `blocked` / `undetermined`. `blocked` is derived from
  `canAskAgain === false`: the prompt is spent, so asking again does nothing and
  only the system settings page can undo it. A boolean cannot express that, which
  is why the old code had nothing useful to show the user.

- [x] **Step 2: Read without prompting**

  `getPermissionState()` uses `getPermissionsAsync`, so the screen can check on
  every focus without triggering a prompt. `requestPermissionState()` prompts only
  when the state is still undetermined.

- [x] **Step 3: Fail closed**

  Both wrap in try/catch and return `blocked`, never `granted`. On web and
  unsupported platforms an optimistic fallback would put the dead success message
  straight back.

- [x] **Step 4: Cancel on the way out**

  `cancelReminders()` cancels both scheduled notifications. `requestPermission()`
  stays as a boolean wrapper so the onboarding reveal keeps working unchanged.

## Task 2: Make the screen tell the truth

**Files:** `app/(tabs)/profile.tsx`, `src/i18n/translations.ts`

- [x] **Step 1: Only claim success after scheduling**

  `setReminder` awaits the permission state, and the success toast now sits after
  both `scheduleDailyReminder` and `scheduleStreakSave`.

- [x] **Step 2: Explain the block and offer the way out**

  When the state is not granted, the chosen time is stored as `none` (a time that
  cannot fire must not look set), and an alert explains that nothing was scheduled
  with an "Open settings" action calling `Linking.openSettings()`.

- [x] **Step 3: The row reflects permission, not storage**

  `reminderBlocked = permission === 'blocked' && a time is set` — with no reminder
  wanted, permission is irrelevant and the row should just read "Off". Blocked
  shows a crossed-out bell and "Off — notifications are blocked", and tapping goes
  to the system settings rather than reopening a picker that cannot help.

- [x] **Step 4: Recover when they come back**

  `useFocusEffect` re-reads the permission, so granting it in the system settings
  and returning fixes the row without a restart.

- [x] **Step 5: Five strings × six languages**

## Task 3: Guard it

**Files:** `src/services/notificationPermission.test.ts`

- [x] Eight assertions: three states exist, `blocked` comes from `canAskAgain`,
      reading does not prompt, both entry points fail closed, off cancels the
      schedule, the success toast sits after the gate, the blocked path offers
      settings and stores `none`, the row derives from permission, and the screen
      refreshes on focus.

- [x] **Proved they fail:** moved the success toast before the gate (caught),
      removed the cancel from the off branch (caught), hard-coded
      `reminderBlocked = false` (caught), and made the catch return `granted`
      (caught).

## Task 4: Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test` (69/69),
      `npm run scripture-check`, `npm run release-gate`, Android Expo export.
- [x] Rendered the blocked row from the web export: crossed-out bell,
      "Günlük hatırlatma · Kapalı — bildirimler engelli", wrapping cleanly over two
      lines, no page errors. Chromium reports `Notification.permission: default`
      and CDP `Browser.setPermission` did not change it, so the permission state
      was forced in the service for the screenshot and the service was restored
      immediately after — the row logic under test was the real code.

## Left open

- The reminder picker is still a native `Alert` with three fixed times; roadmap
  item 17 replaces it with a real time picker.
- `app/onboarding/reveal.tsx` still uses the boolean `requestPermission` and
  silently skips scheduling when denied. That is not a false claim — it says
  nothing — but once item 17 lands it would be worth surfacing the same blocked
  state there.
