# Copy-accuracy release check (roadmap item 20)

Goal: one checklist, and a release requirement, where every claim the app makes
about licences, prices, trials, notifications and privacy is matched against what
the code actually does.

## Why a command and not a screen

The item says "screen". A developer screen inside the app would ship as dead
weight to every user and, more importantly, could not stop anything: someone has
to remember to open it. The point of the item is that the checklist be a *release
condition*, so it is a command whose output is the checklist and whose exit code
is the gate. Noted in the roadmap entry so the deviation is visible.

## What it checks

`scripts/check-release-claims.mjs`, 17 claims in five areas. Each one pairs a
sentence the app publishes with the code that has to back it.

**Licence** — the six editions named in the Terms are the six in the rights
registry; every licence the registry names appears in the Terms; the Terms make no
blanket "all public domain" claim. (Per-edition rights are the Scripture gates'
job; this catches the two drifting apart.)

**Price** — no literal amount anywhere in the paywall; `DEV_PLANS` is behind
`__DEV__` and appears nowhere else; prices come from `priceString` /
`pricePerMonthString`.

**Trial** — every `paywall.trial*` line rendered is preceded by a `trialEligible`
check; trial length is read from the store's intro offer, not a constant.

**Notifications** — the policy's "scheduled locally on your device" and "we do not
run a server that sends you push messages" are backed by: no push-token call, no
push provider dependency, only `scheduleNotificationAsync`.

**Privacy** — no analytics/tracking dependency; no sign-in code or auth provider;
the payment processor the policy names is the one in `package.json`; no HTTP
client in app code (tests excluded, since they read source text and mention the
names deliberately); the in-app contact address is the constant the policies
interpolate.

## Task 1: Build it

- [x] Assertions run against comment-stripped source, the same discipline the
      other guards needed — files quote old code in comments on purpose.
- [x] Output is a readable report: every claim printed with ✓/✗ and a detail line,
      grouped by area, so a failure says which promise is broken.
- [x] The failure message states the actual rule: *a claim in a policy is a
      promise; shipping one the code does not keep is the defect* — and offers both
      remedies, change the behaviour or change the claim.

## Task 2: Prove it fails

- [x] Hard-coded a price into the paywall — caught.
- [x] Removed the `__DEV__` gate from the development price list — caught.
- [x] Added `posthog-react-native` to dependencies — caught.
- [x] Renamed an edition in the Terms so it no longer matched the registry — caught.

## Task 3: Make it the release requirement

- [x] `npm run release-check` = `scripture-check` + `release-gate` +
      `release-claims`. One command.
- [x] The APK workflow runs `release-check` before `expo prebuild`, so a release
      artifact cannot be produced past any of the three.
- [x] CI runs `scripture-check` and `release-claims` on every push. The rights
      gate deliberately stays out of per-push CI: it must block releases, not
      development.
- [x] `docs/go-live-checklist.md` now names `release-check` as the pre-submit
      requirement.

## A conflict this surfaced

The checklist's post-launch section says "Add analytics (PostHog/Amplitude)". The
Privacy Policy says the app uses no third-party tracking and no analytics. Those
cannot both be true, and `release-claims` will fail the moment such a dependency
lands — which is the check doing its job. The checklist now says so, and requires
the policy, the store privacy labels and the SDK to change together.

## Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test` (101/101),
      `npm run release-check` (all 17 claims pass), Android Expo export.

## Left open

- The claims are matched by pattern against source. That catches the realistic
  regressions — a dependency added, a gate removed, a literal price pasted in —
  but it cannot prove a *runtime* behaviour, only that the code that would break
  the promise is absent. Device verification of price/trial copy against a sandbox
  store account is still a human step in the go-live checklist.
- `docs/store-listing.md` is not checked. Store copy makes claims too, and it is
  the other place a price or trial promise can drift.
