// src/proxy.ts - Enhanced version with improvements
import { type NextRequest, NextResponse } from 'next/server';

import { auth, type Session } from '@/server/auth';

// Type-safe role checking
type UserRole = 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT';

// Public routes that don't require authentication
const publicRoutes = [
  '/', // Home page
  '/login', // Login page
  '/register', // Registration
  '/register-provider', // Provider registration
  '/choose-role', // Role selection
  '/about', // Public info pages
  '/contact',
  '/services',
  '/privacy',
  '/terms',
  '/api/auth', // Auth API routes
  '/api/health', // Health check
  '/api/trpc', // tRPC endpoints (auth handled internally)
  '/_next', // Next.js internals
  '/favicon.ico',
  '/manifest.webmanifest', // PWA manifest
  '/manifest.ts', // Manifest route
  '/icons', // Static icons
  '/sentry-example-page', // Sentry test page
  '/test-page' // Test page
] as const;

// Static asset patterns
const staticAssetPatterns = [
  /\.(png|ico|json|webp|svg|css|js|jpg|jpeg|gif|woff2?|ttf|eot)$/i,
  /^\/icons\/.*/i,
  /^\/images\/.*/i
];

// Role-based access rules
const routePermissions: Record<string, UserRole[]> = {
  '/dashboard/billing': ['ADMIN', 'STAFF'],
  '/dashboard/growth-charts': ['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT'],
  '/dashboard/medical-records': ['ADMIN', 'DOCTOR', 'STAFF'],
  '/dashboard/prescriptions': ['ADMIN', 'DOCTOR'],
  '/dashboard/patients': ['ADMIN', 'DOCTOR', 'STAFF'],
  '/dashboard/appointments': ['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT'],
  '/dashboard/vaccines': ['ADMIN', 'DOCTOR', 'STAFF'],
  '/dashboard/travel-clearances': ['ADMIN', 'DOCTOR', 'STAFF'],
  '/dashboard/settings': ['ADMIN', 'STAFF']
};

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // 1. Check static assets first (fastest)
    if (staticAssetPatterns.some(pattern => pattern.test(pathname))) {
      return NextResponse.next();
    }

    // 2. Check exact public routes
    if (publicRoutes.includes(pathname as (typeof publicRoutes)[number])) {
      return NextResponse.next();
    }

    // 3. Check public route prefixes
    if (publicRoutes.some(route => route !== '/' && pathname.startsWith(route) && route.length > 1)) {
      return NextResponse.next();
    }

    // 4. Get session using request headers
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // 5. Redirect to login if no session
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (session.user.role as string).toUpperCase() as UserRole;

    // 6. Admin bypass - can access everything
    if (role === 'ADMIN') {
      return addUserHeaders(NextResponse.next(), session);
    }

    // 7. Check dashboard route permissions
    for (const [route, allowedRoles] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        // Log unauthorized access attempt (for monitoring)
        console.warn(`Unauthorized access attempt: ${role} tried to access ${pathname}`);

        // Redirect to dashboard home with error
        const dashboardUrl = new URL('/dashboard', request.url);
        dashboardUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // 8. API routes access control
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/trpc')) {
      // Admin API routes
      if (pathname.startsWith('/api/admin') && role !== 'DOCTOR') {
        return NextResponse.json({ error: 'Unauthorized', message: 'Admin access required' }, { status: 403 });
      }

      // Analytics API
      if (pathname.startsWith('/api/analytics') && !['ADMIN', 'STAFF'].includes(role)) {
        return NextResponse.json({ error: 'Unauthorized', message: 'Insufficient permissions' }, { status: 403 });
      }

      // Upload API - staff and above
      if (pathname.startsWith('/api/upload') && !['ADMIN', 'STAFF', 'DOCTOR'].includes(role)) {
        return NextResponse.json({ error: 'Unauthorized', message: 'Upload permission denied' }, { status: 403 });
      }
    }

    // 9. Add user headers and continue
    return addUserHeaders(NextResponse.next(), session);
  } catch (error) {
    // Log error but don't expose internals
    console.error('Proxy error:', error);

    // Fail open to login on error
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'proxy_error');
    return NextResponse.redirect(loginUrl);
  }
}

// Helper to add user headers to response
function addUserHeaders(response: NextResponse, session: Session) {
  response.headers.set('x-user-id', session.user.id);
  response.headers.set('x-user-role', session.user.role ?? 'DOCTOR');
  response.headers.set('x-user-email', session.user.email ?? '');

  // Add user name if available
  if (session.user.name) {
    response.headers.set('x-user-name', session.user.name);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
};
