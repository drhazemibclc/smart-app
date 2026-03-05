import * as Sentry from '@sentry/nextjs';

export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Add only the essentials
    debug: false,

    // Add optional integrations for additional features

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,
    // Enable logs to be sent to Sentry
    enableLogs: true,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
