// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

// Check if we're in a valid environment for Sentry
const isSentryEnabled =
  process.env.NODE_ENV === 'production' ||
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  process.env.SENTRY_DSN;

// Only initialize if we have a DSN and we're not in a problematic environment
if (isSentryEnabled && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: 'https://7e9d3f06c165ff252a3cde71b0a55247@o4507963687698432.ingest.us.sentry.io/4510169181454336',

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,  // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',

    // Disable in development to avoid instrumentation issues
    enabled: process.env.NODE_ENV === 'production',

    // Add environment
    environment: process.env.NODE_ENV || 'development',
  });
} else {
  console.log('📝 Sentry disabled in current environment');
}

export default Sentry;
