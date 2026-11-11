# Production error monitoring

The app includes an optional Sentry integration. It sends nothing when
`EXPO_PUBLIC_SENTRY_DSN` is absent. Error messages, breadcrumbs, arbitrary
extras, user details, and request bodies are removed before an event is sent;
stack frames and a static call-site tag remain. Journal entries, prayer text,
and onboarding answers must never be added as tags or event context.

To activate it, create a Sentry React Native project and set the public DSN as
the GitHub Actions repository variable `SENTRY_DSN` for Android releases. Add
`EXPO_PUBLIC_SENTRY_DSN` to other build environments. For symbolicated stack
traces, also add the repository variables `SENTRY_ORG` and `SENTRY_PROJECT`
(slugs) and the secret `SENTRY_AUTH_TOKEN` (Organization token). Without that
secret, CI sets `SENTRY_DISABLE_AUTO_UPLOAD=true` so release builds skip
source-map upload instead of failing. Verify a test exception in a development
build and inspect the received event for private data before shipping.

This integration does not include a Sentry account or DSN. Until those are
configured, production errors are still not delivered to a central dashboard.
