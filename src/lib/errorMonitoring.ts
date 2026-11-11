import * as Sentry from '@sentry/react-native';
import { setErrorSink } from '@/lib/reportError';

/** Enable production diagnostics only after a project DSN is configured. */
export function initErrorMonitoring(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeBreadcrumb: () => null,
    beforeSend: (event) => {
      // Error messages can contain user-entered journal or prayer text.
      // Keep stack frames and a static call-site tag, never raw messages,
      // breadcrumbs, request bodies or arbitrary extras.
      event.message = 'Unexpected application error';
      for (const value of event.exception?.values ?? []) value.value = '[redacted]';
      delete event.extra;
      delete event.user;
      delete event.request;
      delete event.breadcrumbs;
      return event;
    },
  });

  setErrorSink((error, context) => {
    Sentry.withScope((scope) => {
      scope.setTag('call_site', context);
      Sentry.captureException(error);
    });
  });
}
