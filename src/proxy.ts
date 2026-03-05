// src/proxy.ts - Production-Ready with Fixed Issues
import { type NextRequest, NextResponse } from 'next/server';

import { auth, type Session } from '@/server/auth';

// Type-safe role checking
type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'STAFF' | 'PATIENT';

// Public routes that don't require authentication
const publicRoutes = new Set([
  '/',
  '/login',
  '/register',
  '/register-provider',
  '/choose-role',
  '/about',
  '/contact',
  '/services',
  '/privacy',
  '/terms',
  '/api/auth',
  '/api/health',
  '/api/trpc',
  '/_next',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/manifest.ts',
  '/icons',
  '/sentry-example-page',
  '/test-page'
]);

// Static asset patterns - more comprehensive
const staticAssetPatterns = [
  /\.(png|ico|json|webp|svg|css|js|jpg|jpeg|gif|woff2?|ttf|eot|pdf|txt)$/i,
  /^\/icons\/.*/i,
  /^\/images\/.*/i,
  /^\/_next\/static\/.*/i,
  /^\/_next\/image\/.*/i
];

// Role-based access rules - comprehensive and sorted by specificity
const routePermissions: Array<{ pattern: RegExp; allowedRoles: UserRole[] }> = [
  // Admin only routes
  { pattern: /^\/dashboard\/admin(\/.*)?$/, allowedRoles: ['ADMIN'] },
  { pattern: /^\/api\/admin(\/.*)?$/, allowedRoles: ['ADMIN'] },

  // Billing routes
  { pattern: /^\/dashboard\/billing(\/.*)?$/, allowedRoles: ['ADMIN', 'STAFF'] },
  { pattern: /^\/api\/billing(\/.*)?$/, allowedRoles: ['ADMIN', 'STAFF'] },

  // Medical records
  { pattern: /^\/dashboard\/medical-records(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'STAFF'] },
  { pattern: /^\/api\/medical-records(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE'] },

  // Prescriptions
  { pattern: /^\/dashboard\/prescriptions(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR'] },
  { pattern: /^\/api\/prescriptions(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR'] },

  // Patients
  { pattern: /^\/dashboard\/patients(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'STAFF'] },
  { pattern: /^\/api\/patients(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE'] },

  // Appointments
  { pattern: /^\/dashboard\/appointments(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'PATIENT'] },
  { pattern: /^\/api\/appointments(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE'] },

  // Vaccines
  { pattern: /^\/dashboard\/vaccines(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'STAFF'] },
  { pattern: /^\/api\/vaccines(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE'] },

  // Growth charts
  { pattern: /^\/dashboard\/growth-charts(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'PATIENT'] },

  // Travel clearances
  { pattern: /^\/dashboard\/travel-clearances(\/.*)?$/, allowedRoles: ['ADMIN', 'DOCTOR', 'NURSE'] },

  // Settings
  { pattern: /^\/dashboard\/settings(\/.*)?$/, allowedRoles: ['ADMIN', 'STAFF'] },

  // Analytics
  { pattern: /^\/api\/analytics(\/.*)?$/, allowedRoles: ['ADMIN', 'STAFF'] },

  // Upload
  { pattern: /^\/api\/upload(\/.*)?$/, allowedRoles: ['ADMIN', 'STAFF', 'DOCTOR', 'NURSE'] }
];

// Cache for session to avoid repeated calls in same request
const sessionCache = new WeakMap<Request, Session | null>();

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // 1. Quick bypass for static assets (fastest path)
    if (isStaticAsset(pathname)) {
      return NextResponse.next();
    }

    // 2. Check public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // 3. Get session with caching
    const session = await getCachedSession(request);

    // 4. Redirect to login if no session
    if (!session?.user) {
      return redirectToLogin(request);
    }

    // 5. Normalize role
    const role = normalizeRole(session.user.role);

    // 6. Admin bypass - can access everything
    if (role === 'ADMIN') {
      return addUserHeaders(NextResponse.next(), session);
    }

    // 7. Check route permissions
    const permissionCheck = checkRoutePermission(pathname, role);
    if (!permissionCheck.allowed) {
      return handleUnauthorized(request, role, pathname, permissionCheck.reason);
    }

    // 8. API routes CORS handling
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/trpc')) {
      return handleApiRequest(request, session, role);
    }

    // 9. Add user headers and continue
    return addUserHeaders(NextResponse.next(), session);
  } catch (error) {
    return handleProxyError(request, error);
  }
}

// ==================== Helper Functions ====================

function isStaticAsset(pathname: string): boolean {
  return staticAssetPatterns.some(pattern => pattern.test(pathname));
}

function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (publicRoutes.has(pathname)) {
    return true;
  }

  // Prefix match for routes like /api/auth/*
  for (const route of publicRoutes) {
    if (route !== '/' && pathname.startsWith(route + '/')) {
      return true;
    }
  }

  return false;
}

async function getCachedSession(request: NextRequest): Promise<Session | null> {
  // Check cache first
  if (sessionCache.has(request)) {
    return sessionCache.get(request) || null;
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // Cache for this request
    if (session) {
      sessionCache.set(request, session);
    }

    return session;
  } catch (error) {
    console.error('Session fetch error:', error);
    return null;
  }
}

function normalizeRole(role: string | undefined): UserRole {
  if (!role) return 'PATIENT';

  const upperRole = role.toUpperCase();

  // Map any variations to valid roles
  if (upperRole.includes('ADMIN')) return 'ADMIN';
  if (upperRole.includes('DOCTOR')) return 'DOCTOR';
  if (upperRole.includes('NURSE')) return 'NURSE';
  if (upperRole.includes('STAFF')) return 'STAFF';

  return 'PATIENT';
}

function checkRoutePermission(pathname: string, role: UserRole): { allowed: boolean; reason?: string } {
  // Find the most specific matching pattern
  const matchingRule = routePermissions.find(rule => rule.pattern.test(pathname));

  if (!matchingRule) {
    // No specific rule found - allow access to non-dashboard routes
    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/api')) {
      return { allowed: true };
    }

    // Dashboard routes without specific rules default to staff+
    if (pathname.startsWith('/dashboard') && !['ADMIN', 'DOCTOR', 'NURSE', 'STAFF'].includes(role)) {
      return { allowed: false, reason: 'Dashboard access requires staff privileges' };
    }

    return { allowed: true };
  }

  // Check if role is allowed
  if (!matchingRule.allowedRoles.includes(role)) {
    return {
      allowed: false,
      reason: `This area requires ${matchingRule.allowedRoles.join(' or ')} privileges`
    };
  }

  return { allowed: true };
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function handleUnauthorized(request: NextRequest, role: UserRole, pathname: string, reason?: string): NextResponse {
  // Log for monitoring
  console.warn(
    `🚫 Unauthorized access: role=${role}, path=${pathname}, reason=${reason || 'insufficient permissions'}`
  );

  // API routes return JSON
  if (pathname.startsWith('/api')) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: reason || 'You do not have permission to access this resource',
        code: 'FORBIDDEN'
      },
      { status: 403 }
    );
  }

  // Page routes redirect to dashboard with error
  const dashboardUrl = new URL('/dashboard', request.url);
  dashboardUrl.searchParams.set('error', 'unauthorized');
  if (reason) {
    dashboardUrl.searchParams.set('reason', reason);
  }

  return NextResponse.redirect(dashboardUrl);
}

function handleApiRequest(request: NextRequest, session: Session, role: UserRole): NextResponse {
  // Handle preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Add user headers
  addUserHeaders(response, session);

  return response;
}

function addUserHeaders(response: NextResponse, session: Session): NextResponse {
  response.headers.set('x-user-id', session.user.id);
  response.headers.set('x-user-role', session.user.role ?? 'PATIENT');
  response.headers.set('x-user-email', session.user.email ?? '');

  if (session.user.name) {
    response.headers.set('x-user-name', session.user.name);
  }

  return response;
}

function handleProxyError(request: NextRequest, error: unknown): NextResponse {
  // Log error (but don't expose internals)
  console.error('❌ Proxy error:', error);

  const isApi = request.nextUrl.pathname.startsWith('/api');

  if (isApi) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'PROXY_ERROR'
      },
      { status: 500 }
    );
  }

  // For page routes, redirect to login with error
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'proxy_error');
  return NextResponse.redirect(loginUrl);
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
