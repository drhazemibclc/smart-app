import * as Sentry from '@sentry/nextjs';

// Skip in development to avoid instrumentation issues
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: 'production',
    enabled: true
  });
}
