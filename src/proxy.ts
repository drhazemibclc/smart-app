import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/env/server';
import { auth } from '@/server/auth';

export async function proxy(request: NextRequest) {
  // 1. Skip WebSocket upgrades early
  const upgradeHeader = request.headers.get('upgrade');
  if (upgradeHeader?.toLowerCase() === 'websocket') {
    return NextResponse.next();
  }

  // 2. Auth Check
  // Note: In Next 15/16, headers() is async.
  // We use the request headers directly for better performance in middleware.
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (session?.user) {
    return NextResponse.next();
  }

  // 3. Resolve Redirect URL
  const publicOrigin = getPublicOrigin(request);

  // Safeguard: Default to the request's own origin if the public one is untrusted or missing
  const baseUrl =
    publicOrigin && env.CORS_ORIGIN.includes(publicOrigin)
      ? publicOrigin
      : env.BETTER_AUTH_URL || request.nextUrl.origin;

  const loginUrl = new URL('/login', baseUrl);

  // 4. Set callback URL - Ensure we don't redirect to /login from /login
  const path = request.nextUrl.pathname;
  if (path !== '/login') {
    loginUrl.searchParams.set('callbackUrl', `${path}${request.nextUrl.search}`);
  }

  return NextResponse.redirect(loginUrl, 307);
}

function getPublicOrigin(request: NextRequest) {
  const h = request.headers;
  // Standard headers for reverse proxies (Vercel, Cloudflare, Nginx)
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('x-forwarded-host') ?? h.get('host');

  if (!host) return null;

  // Remove port if it's standard to avoid mismatch with env.CORS_ORIGIN strings
  const cleanHost = host.replace(/:(80|443)$/, '');
  return `${proto}://${cleanHost}`;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth, api/trpc, etc (Internal APIs)
     * - _next/static, _next/image (static files)
     * - login, signup, favicon.ico (public pages)
     */
    '/((?!api/auth|api/health|api/trpc|api/analytics|trpc|_next|_static|favicon|icons|manifest|robots|login|signup|auth-error|sw.js|.*\\.png|.*\\.ico|.*\\.json|.*\\.webp|.*\\.svg|.*\\.css).*)'
  ]
};
