# Separate PillButton's busy state from disabled (roadmap item 39)

Goal: not every inactive button is "busy"; a spinner and the correct
accessibility state should show during loading.

## Task 1: Find the conflation

`PillButton`'s `accessibilityState={{ disabled: Boolean(disabled), busy:
Boolean(disabled) }}` — `busy` was never its own signal, just a copy of
`disabled`. Checked both real call sites that pass `disabled`:

| Caller | Reason | Actually loading? |
| --- | --- | --- |
| `onboarding/quiz.tsx` | name field empty | No |
| `(tabs)/journal.tsx` | entry text empty | No |

Neither is a loading state. Both were telling TalkBack "busy" anyway.

## Task 2: A dedicated prop

**Files:** `src/components/PillButton.tsx`

- [x] Added `busy?: boolean`, independent of `disabled`.
- [x] `const inactive = Boolean(disabled) || Boolean(busy)` drives the visual
      "inactive" look and the native `disabled` prop — busy still blocks
      presses, on top of whatever `disabled` already says.
- [x] `accessibilityState={{ disabled: inactive, busy: Boolean(busy) }}` — only
      the dedicated prop reaches `busy` now.
- [x] An `ActivityIndicator` renders alongside the label when `busy`, the
      spinner the item explicitly asks for.

## Task 3: The one real busy caller

**Files:** `app/paywall.tsx`

- [x] The purchase button's `disabled={busy || pending || !selectedPlan}` is
      unchanged — all three reasons should still block a tap. A new
      `busy={busy}` alongside it means only the one reason that's actually
      "in progress" reaches `accessibilityState.busy`.

## Task 4: The same bug's shape, found next to the fix

`paywall.tsx`'s "Restore purchases" button (a bespoke `Pressable`, not
`PillButton`) already had `accessibilityState.busy` correctly wired to its own
`restoreStatus === 'busy'` check — that part was fine. But its
`accessibilityLabel` was frozen on `tr('paywall.restore')` regardless of state,
while the *visible* text next to it already switched to `tr('paywall.restoring')`.
`busy` was announced; the label read out didn't match what was on screen.

- [x] `accessibilityLabel` now follows the same condition as the visible text.

## Task 5: Guard it

**Files:** `src/a11y/busyState.test.ts`

- [x] `PillButton`'s `busy` state is sourced from its own prop, checked by
      name, and the old conflated shape is checked absent.
- [x] A busy button renders the spinner and stays non-interactive via
      `inactive`.
- [x] The paywall's purchase button passes `busy` as a separate prop from
      `disabled`.
- [x] The restore label matches its own visible-text condition.
- [x] **Proved it fails:** reverted the accessibilityState to the old
      conflated shape, removed the spinner, dropped the paywall's `busy` prop,
      and re-froze the restore label. Four injections, four catches.

## Task 6: Verify

- [x] `npm test` (156/156), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views — the added
      `flexDirection: row` + spinner didn't change any button's rendered
      size), Android export.
- [x] Browser check: Quiz's "Devam" and Journal's "Kaydet", both currently
      disabled by an empty field, now render `aria-disabled="true"` with
      `aria-busy` **absent** — previously it would have been `"true"`.
      Separately confirmed `aria-busy` is a real, supported attribute in the
      react-native-web bundle (not one of this session's several
      native-only-limitation cases), so "absent" here means genuinely false,
      not unmapped.

## Left open

- The paywall's purchase button, while busy, now shows a spinner *inside* the
  pill (new) in addition to the existing external progress row below it
  (unchanged) — a small visual redundancy (two spinners, "Processing" appearing
  in both the button's own label and the row underneath). Not fixed here:
  removing either would mean redesigning an already-working, already-tested
  screen for tidiness, which is a different kind of change than fixing the
  accessibility-state bug this item asked for.
