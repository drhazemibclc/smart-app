import type { Role } from '@/types/auth';
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/register-provider',
  '/choose-role',
  '/api/auth',
  '/_next',
  '/favicon.ico'
];

export const AUTH_ROUTES = ['/login', '/register', '/register-provider', '/choose-role'];

export const PROTECTED_ROUTES = ['/dashboard', '/admin', '/doctor', '/staff', '/patient', '/record'];

// Better-Auth returns lowercase roles, so we use lowercase keys
// All roles redirect to /dashboard
export const ROLE_REDIRECTS: Record<Role, string> = {
  admin: '/dashboard',
  doctor: '/dashboard',
  staff: '/dashboard',
  patient: '/dashboard'
};

export const DEFAULT_REDIRECT = '/';

type RouteAccessProps = {
  [key: string]: string[];
};

export const createRouteMatcher = (routes: string[]) => {
  const regex = new RegExp(`^(${routes.map(route => route.replace(/\(\.\*\)/, '.*')).join('|')})$`);
  return (pathname: string) => regex.test(pathname);
};

/**
 * Route access configuration.
 * Uses uppercase roles to match database format (ADMIN, DOCTOR, STAFF, PATIENT).
 *
 * Note: 'nurse' and 'lab_technician' are mapped to 'STAFF' role in the database.
 */
export const routeAccess: RouteAccessProps = {
  '/admin(.*)': ['ADMIN'],
  '/patient(.*)': ['PATIENT', 'ADMIN', 'DOCTOR', 'STAFF'],
  '/doctor(.*)': ['DOCTOR'],
  '/staff(.*)': ['STAFF', 'ADMIN', 'DOCTOR'], // STAFF includes nurses, lab technicians, etc.
  '/record/users': ['ADMIN'],
  '/record/doctors': ['ADMIN'],
  '/record/doctors(.*)': ['ADMIN', 'DOCTOR'],
  '/record/staffs': ['ADMIN', 'DOCTOR'],
  '/record/patients': ['ADMIN', 'DOCTOR', 'STAFF'],
  '/record/appointments': ['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT'],
  '/record/medical-records': ['ADMIN', 'DOCTOR', 'STAFF'],
  '/record/billing': ['ADMIN', 'DOCTOR'],
  '/patient/registrations': ['PATIENT']
};

/**
 * Check if a user role has access to a specific route.
 *
 * @param pathname - The route pathname to check
 * @param userRole - The user's role (should be uppercase: ADMIN, DOCTOR, STAFF, PATIENT)
 * @returns true if user has access, false otherwise
 */

export function checkRouteAccess(pathname: string, role: Role): boolean {
  const roleAccessMap: Record<Role, string[]> = {
    admin: ['/admin', '/dashboard', '/record'],
    doctor: ['/doctor', '/dashboard', '/record'],
    staff: ['/staff', '/dashboard', '/record'],
    patient: ['/patient', '/dashboard']
  };

  return roleAccessMap[role]?.some(route => pathname.startsWith(route)) ?? false;
}

/**
 * Get redirect path for a role
 */
export function getRoleRedirect(role: Role) {
  if (!role) return '/login';
  return ROLE_REDIRECTS[role] ?? DEFAULT_REDIRECT;
}

/**
 * Check if a path is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a path is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}
