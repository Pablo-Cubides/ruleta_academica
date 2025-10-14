// Initialize Sentry only when SENTRY_DSN is provided.
// Use dynamic import so builds without @sentry/node do not fail at typecheck time.
let initialized = false;
let _Sentry: any = null;

export async function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || initialized) return;
  try {
    // Use a runtime require to avoid static TypeScript resolution errors when
    // `@sentry/node` is not installed in the environment.
  // Use runtime require to avoid static TS resolution when package is absent
  const req: any = Function('return require')();
    const Sentry = req('@sentry/node');
    _Sentry = Sentry;
    Sentry.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.0),
      environment: process.env.NODE_ENV ?? 'development',
    });
    initialized = true;
  } catch (err) {
    // If the package isn't installed, just log and continue.
    // eslint-disable-next-line no-console
    console.warn('Sentry not initialized (missing package or error):', err?.message ?? err);
  }
}

export function captureException(e: unknown, extra?: Record<string, unknown>) {
  if (!initialized || !_Sentry) return;
  try {
    _Sentry.withScope((scope: any) => {
      if (extra) Object.entries(extra).forEach(([k, v]) => scope.setExtra(k, v));
      if (e instanceof Error) _Sentry.captureException(e);
      else _Sentry.captureMessage(String(e));
    });
  } catch (err) {
    // swallow any sentry errors to avoid interfering with app flow
    // eslint-disable-next-line no-console
    console.error('Sentry capture failed', err);
  }
}

// Export only named functions to avoid default-export lint rules.
