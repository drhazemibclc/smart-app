#!/bin/bash
# scripts/fix-sentry.sh

echo "🔧 Fixing Sentry configuration..."

# Backup existing configs
cp sentry.server.config.ts sentry.server.config.ts.backup 2>/dev/null || true
cp sentry.client.config.ts sentry.client.config.ts.backup 2>/dev/null || true

# Create fixed server config
cat > sentry.server.config.ts << 'EOF'
import * as Sentry from '@sentry/nextjs';

// Skip in development to avoid instrumentation issues
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: 'production',
    enabled: true,
  });
}
EOF

# Create fixed client config
cat > sentry.client.config.ts << 'EOF'
import * as Sentry from '@sentry/nextjs';

if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: 'production',
    enabled: true,
  });
}
EOF

# Create proper instrumentation
mkdir -p src
cat > src/instrumentation.ts << 'EOF'
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    const Sentry = await import('@sentry/nextjs');
    console.log('📊 Sentry initialized');
  }
}
EOF

echo "✅ Sentry fixed! Try running now:"
echo "npm run dev -- --webpack -p 3000"
