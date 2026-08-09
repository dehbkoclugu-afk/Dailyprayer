# Accessible confirmation for destructive actions (roadmap item 40)

Goal: audit the app's delete/destructive confirmation flow against the
item's three named criteria — Alert button order, cancel default, TalkBack
description — in every language, and fix whatever is actually wrong.

## Task 1: Find every destructive confirmation surface

- [x] `grep`'d every `Alert.alert`/`Alert.prompt` call (7 total, `app` +
      `src`). None are delete/destructive confirmations:
      - `paywall.tsx`: purchase-fail ×2, restore-error, support-error — all
        single-button error dialogs.
      - `profile.tsx`: reminder-permission-blocked (the one two-choice
        Alert, not destructive), contact-failed, manage-subscription-error.
- [x] The app's actual destructive action — delete all data / restart
      onboarding — is confirmed by a custom two-stage sheet,
      `DataActionSheet` (roadmap item 14), not a native `Alert`. Confirmed
      via its usage site in `profile.tsx`.
- [x] `journal.tsx`'s per-entry delete is a different pattern entirely —
      immediate delete with an undo toast (roadmap item 15), not a
      confirm-before-acting flow. It doesn't fall under "use accessible
      confirmation" the way an irreversible action does, since the action
      itself is reversible for several seconds after the tap.

## Task 2: Audit `DataActionSheet` against the three criteria

**Files:** `src/components/DataActionSheet.tsx`, `src/i18n/translations.ts`

- [x] **Button order.** Confirm renders above Cancel — the iOS
      action-sheet convention (destructive action listed first, Cancel
      always last, the fixed escape hatch), not the horizontal-Alert
      convention. These are two different, both-correct conventions for two
      different widgets; forcing them to match would be wrong, not a fix.
- [x] **Cancel default.** `<Modal onRequestClose={onClose} ...>` maps the
      hardware/gesture back action to Cancel already.
- [x] **Danger styling is stage-gated.** The Confirm button is neutral
      (`t.surfaceAlt`) in stage 1 ("Continue") and only turns `t.danger` in
      stage 2 ("Yes, delete everything" / "Yes, restart onboarding") — the
      alarming look is reserved for the actually-final choice.
- [x] **TalkBack description, all six locales.** Read `data.deleteTitle`,
      `data.deleteBody`, `data.deleteFinalTitle`, `data.deleteFinalBody`,
      `data.deleteConfirm`, `data.restart*`, `data.cancel`, `data.continue`
      across `en`/`tr`/`es`/`pt`/`fr`/`de`. All six are complete, distinct
      per stage, and every locale's final-stage body names the action as
      irreversible ("There is no undo." / "Geri alma yok." / "No hay vuelta
      atrás." / "Não há como desfazer." / "Aucun retour possible." / "Es
      gibt kein Zurück.").
- [x] The one native Alert with a real two-way choice
      (`profile.tsx`'s reminder-blocked dialog) already puts Cancel in the
      platform-conventional slot: `[{ text: cancel, style: 'cancel' },
      { text: openSettings }]` — `buttons[0]` is RN's negative/dismiss slot
      on Android, and `style: 'cancel'` is what iOS bolds as the dismiss
      action. Checked for completeness, not touched.

## Task 3: What was actually broken

`DataActionSheet` itself checked out on all three named criteria. What
didn't: **closing it never returns accessibility focus to the row that
opened it.**

`useTriggerFocus` was built for exactly this in item 28 — after a sheet
closes (Cancel, backdrop tap, or completing the action), VoiceOver/TalkBack
focus is left wherever the sheet last put it (its own title, per
`useSheetTitleFocus`) instead of going back to the trigger. `profile.tsx`
wires it up for the appearance and language sheets (`appearanceRef`,
`languageRef`) — but not for the "Restart onboarding" and "Delete all my
data" rows that open the app's *only* irreversible action. Confirmed by
grepping every `useTriggerFocus(` call in the file: 2, both for sheets that
aren't destructive.

**Files:** `app/(tabs)/profile.tsx`

- [x] Added `const restartRef = useTriggerFocus(dataAction === 'restart')`
      and `const deleteRef = useTriggerFocus(dataAction === 'delete')`,
      next to the existing pair.
- [x] Attached `ref={restartRef}` / `ref={deleteRef}` to the two trigger
      `Pressable`s.

## Task 4: Guard it

**Files:** `src/a11y/destructiveConfirm.test.ts` (new),
`src/a11y/sheetFocus.test.ts` (updated)

- [x] New file checks: the two refs exist and are sourced from
      `useTriggerFocus` keyed to their own `dataAction` value; each ref is
      attached to the matching trigger; `onRequestClose` still maps to
      Cancel; the danger-color styling is still stage-gated; the
      reminder-blocked Alert still puts Cancel first; all six locales still
      define `data.deleteFinalBody`.
- [x] The pre-existing item-28 guard in `sheetFocus.test.ts` — `'app/(tabs)/
      profile.tsx' should return focus for 2 sheets` — enumerated the exact
      known trigger count. Updated it to 4 (appearance, language, restart,
      delete) rather than loosening it to `>= 2`; it should keep enumerating
      every known site by name so a future removal is caught the same way.
- [x] **Proved it fails**, one injection at a time, each reverted before the
      next:
      1. Removed both `ref={...}` attributes → caught by the new file's
         first test.
      2. Replaced both `useTriggerFocus(...)` calls with plain `useRef(null)`
         → caught by both the new file and the updated `sheetFocus.test.ts`
         count.
      3. Changed `onRequestClose={onClose}` to a no-op → caught.
      4. Made the Confirm button always `t.danger` → caught.
      5. Swapped the reminder-blocked Alert's button order → caught.
      6. Deleted one locale's `data.deleteFinalBody` → caught.

## Task 5: Verify

- [x] `npm test` (161/161), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged —
      a `ref` prop doesn't affect layout).
- [x] Android `expo export --platform android` — clean, `.hbc` bundle
      produced, no errors.
- [x] **Browser check attempted, and found not meaningful for this
      specific fix.** A Playwright script opened each trigger, closed the
      sheet via Cancel, and checked `document.activeElement` — it reported
      the correct element **both with the fix in place and with the two
      `ref` props removed**. Reading `ModalFocusTrap.js` in the installed
      `react-native-web` explains why: RN Web's own `<Modal>` already saves
      `document.activeElement` on open and restores it on unmount,
      independent of `useTriggerFocus` or any RN accessibility prop. So on
      web specifically, the bug this fix addresses cannot occur in the
      first place — the platform already does it for free — and the
      browser harness can't distinguish fixed from broken.
      This isn't a new pattern this session, just a variant of it: several
      earlier items found RN accessibility props RNW doesn't map to any DOM
      attribute (unverifiable, native does the real work); this one is the
      mirror case — RNW's *own* Modal does real work natively that this
      app's cross-platform hook was written to add back on iOS and Android,
      where `<Modal>` is a real second-window `Dialog` (Android) or a
      same-window sibling view VoiceOver walks straight through without
      help (iOS) — see `sheetFocus.ts`'s own header comment. Verification
      for this fix is the static analysis in Task 4, not the browser.

## Left open

- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (2.66:1, found
  during item 32) and the `useStreakStore`/`tickToday()` Zustand hydration
  race (found during item 38) remain unresolved and out of this item's
  scope; both are documented in their originating items' plan docs.
