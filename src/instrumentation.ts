// src/instrumentation.ts
import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import Sentry server config (this will initialize Sentry)
    await import('../sentry.server.config');

    // Optional: Add additional server-side initialization
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      console.log('📊 Sentry server-side instrumentation active');
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Fix: onRequestError should NOT call Sentry.init() again
export function onRequestError(error: Error, request: Request, context: Sentry.Context) {
  if (process.env.NODE_ENV === 'production') {
    // Capture the error - Sentry is already initialized from register()
    Sentry.captureException(error, {
      extra: {
        context,
        timestamp: new Date().toISOString(),
        request: { url: request.url, method: request.method }
      },
    });
  }

  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('📝 Request Error (not sent to Sentry):', {
      error: error.message,
      url: request.url,
      method: request.method,
    });
  }
}
