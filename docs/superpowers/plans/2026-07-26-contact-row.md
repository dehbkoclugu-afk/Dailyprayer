# A contact row that reaches someone (roadmap item 18)

Goal: the email row in Profile should open the address, and offer to copy it when
the device has no mail app.

## What was wrong

```
<Row icon="mail-outline" label={tr('profile.contact')} />
```

No `onPress`. `Row` sets `disabled={!onPress}`, so the row rendered a chevron —
promising it went somewhere — and did nothing at all. It also never showed the
address, so a user who could not open mail had no way to learn it.

## Task 1: One address

**Files:** `src/data/legal.ts`

- [x] The contact address was written out three times: the file header, the
      Privacy Policy and the Terms. Now `CONTACT_EMAIL` is exported and the policy
      strings interpolate it. A support address that differs between the app and
      the published policies is a real support failure, so a test asserts both
      documents contain the constant and that it is not re-typed inside them.

## Task 2: One support path

**Files:** `src/services/support.ts`, `app/paywall.tsx`

- [x] **Step 1: Extract what the paywall already had**

  The paywall resolved `EXPO_PUBLIC_SUPPORT_EMAIL` with its own inline regex and
  built its own `mailto:`. That moved into `support.ts` so both surfaces share it.

- [x] **Step 2: Fall back instead of going dead**

  `EXPO_PUBLIC_SUPPORT_EMAIL` is optional. When it is unset or malformed,
  `SUPPORT_EMAIL` falls back to `CONTACT_EMAIL` rather than resolving to null,
  because the policies already promise that address works.
  `SUPPORT_EMAIL_IS_CONFIGURED` stays available for anything that needs to know
  whether the release set its own.

- [x] **Step 3: Encode the subject properly**

  `URLSearchParams` renders spaces as `+`, which some mail clients display
  literally; those are replaced with `%20`.

- [x] **Step 4: Report which thing happened**

  `contactSupport()` returns `'opened' | 'copied' | 'failed'`: it checks
  `Linking.canOpenURL` honestly, opens mail if it can, otherwise puts the address
  on the clipboard. The caller needs to know in order to say so.

## Task 3: The row

**Files:** `app/(tabs)/profile.tsx`

- [x] `Row` gained an optional `value`, matching how the preference rows already
      show their current setting, and the contact row passes the address — visible
      whether or not anything opens.
- [x] `opened` → nothing to say; `copied` → a toast; `failed` → an alert that
      still contains the address.
- [x] Four strings × six languages.

## Task 4: Guard it

**Files:** `src/services/support.test.ts`

- [x] Seven assertions: the address has one definition and both policies use it,
      the row is no longer a bare `Row`, the row shows the address, the clipboard
      fallback exists and is reported, a clipboard failure still names the address,
      the fallback address logic, the subject encoding, and the paywall no longer
      resolving the address itself.
- [x] **Proved they fail:** reverting the row to its inert form (caught), removing
      the clipboard fallback (caught), and hard-coding a different address into the
      privacy policy (caught).

## Task 5: A formatting flaw from item 17

Verifying the row surfaced that the reminder read "7:30" on a Turkish device.
`hour: 'numeric'` drops the leading zero in every locale, but a 24-hour locale
pads it. Switched to `timeStyle: 'short'`, which is the locale's own canonical
short time: `tr-TR`/`de-DE`/`fr-FR` → "07:30", `en-US` → "7:30 AM". Asserted for
both kinds of locale.

## Task 6: Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test` (94/94),
      `npm run scripture-check`, `npm run release-gate`, Android Expo export.
- [x] Rendered from the web export: the row shows "Bize ulaş" with
      `dehbkoclugu@gmail.com` on the right and is tappable. No page errors.
      The clipboard branch is not reachable in a browser — `canOpenURL` accepts
      `mailto:` there — so it is covered by the guard rather than by the render.

## Left open

- `.env.example` still documents `EXPO_PUBLIC_SUPPORT_EMAIL` as optional. If
  support should go somewhere other than the address in the policies, set it for
  the release; otherwise both now agree by construction.
