# Google Play Launch Kit Design

**Date:** 2026-07-28  
**Status:** Approved for planning

## Goal

Prepare the repository-owned material needed for Lumen's first Google Play
submission without inventing product claims or requiring access to the
developer's Play, Expo, RevenueCat, or domain accounts.

## Deliverables

### Store artwork

- Create a 1024×500 PNG feature graphic using the existing Lumen navy, violet,
  cream and gold visual language.
- Use the current app icon and repository artwork as the source of truth.
- Keep all text exact and minimal: app name plus the established English
  positioning. Do not show prices, ratings, awards, trial promises, device
  frames, Play branding, or unsupported functionality.
- Store the final asset under `docs/play-store/assets/`.

### Screenshot kit

- Add a concise capture manifest covering Today, Bible, Prayer, Journal and
  Plus screens.
- Specify phone portrait captures at 360×640 and 390×844, plus tablet and
  landscape QA captures.
- Provide caption copy and ordering, but do not fabricate app screenshots.
  Final screenshots must come from the signed release candidate on a real
  Android device.

### Public legal pages

- Publish the existing privacy policy and terms as accessible static HTML.
- Use GitHub Pages with a repository-owned workflow and a small static site
  under `docs/public/`; no web framework or runtime dependency.
- Keep the Markdown legal files and `src/data/legal.ts` as content sources of
  truth. The public HTML is a release artifact and must remain textually
  consistent with them.
- Include navigation between Privacy, Terms and Support pages, responsive
  typography, semantic headings and a visible support email.
- Deployment produces the URL; the repository must not guess the final GitHub
  Pages hostname before Pages is enabled.

### Play Console declarations

- Add a fill-in-ready declaration sheet for Data Safety, ads, app access,
  target audience, content rating, permissions, privacy URL and billing.
- Base every answer on the current repository and mark account-side
  confirmations explicitly.
- Treat RevenueCat purchase history as collected data and avoid claiming that
  the application collects no data.

### Android release audit

- Add a repository check that verifies package identity, required release
  assets, legal-page consistency and the production AAB workflow contract.
- Keep binary-only checks—target SDK, manifest permissions, 16 KB page-size
  compatibility and signing—documented as post-build checks because they cannot
  be proven without the final AAB.
- Do not force an SDK upgrade before the 31 August 2026 API 36 deadline. The
  uploaded bundle must target API 35 or newer today and should be inspected in
  Play Console before rollout.

## Architecture

The launch kit has three independent layers:

1. `docs/play-store/` contains human-facing store assets and the capture/
   declaration handoff.
2. `docs/public/` contains dependency-free static legal pages.
3. The existing release contract test checks repository-owned invariants and
   leaves signed-binary checks to the AAB handoff.

The GitHub Pages workflow uploads only `docs/public/`. It does not build,
publish or submit the mobile application.

## Validation

- Feature graphic is exactly 1024×500 and visually inspected.
- Static pages contain no placeholders, render at phone and desktop widths,
  expose Privacy/Terms/Support navigation and preserve the legal contact.
- Store captions and declarations contain no unsupported pricing, trial,
  donation, export, analytics or tracking claims.
- Typecheck, lint, tests, release checks and YAML parsing pass.
- Work remains unsubmitted until a signed production AAB passes Play Console's
  bundle inspection and real-device purchase/restore testing.

## Account-side boundary

The developer still must create the Play Console app, enable GitHub Pages,
configure EAS and RevenueCat credentials/products, host or confirm the resulting
legal URLs, capture signed-device screenshots, complete declarations, add
testers and submit the release.
