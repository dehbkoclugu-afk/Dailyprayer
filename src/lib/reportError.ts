/**
 * Central place for unexpected errors that the UI recovers from (failed
 * downloads, storage hiccups, render crashes). Today it logs in development;
 * a crash-reporting SDK (e.g. Sentry with a DSN) plugs in via `setErrorSink`
 * without touching call sites.
 */
type ErrorSink = (error: unknown, context: string) => void;

let sink: ErrorSink = (error, context) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`[Selaora] ${context}`, error);
};

export function setErrorSink(next: ErrorSink): void {
  sink = next;
}

export function reportError(error: unknown, context: string): void {
  try {
    sink(error, context);
  } catch {
    // Reporting must never throw into the caller.
  }
}
