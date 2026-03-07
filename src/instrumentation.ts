export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    // const Sentry = await import('@sentry/nextjs');
    console.log('📊 Sentry initialized');
  }
}
