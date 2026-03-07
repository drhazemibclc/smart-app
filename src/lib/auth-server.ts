import type { Route } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { auth, type Role, type Session } from '@/server/auth';

import type { Clinic } from '../generated/prisma/client';
import { prisma } from '../server/db';
import { getRoleRedirect } from './routes';

const ROLE_ORDER: Role[] = ['patient', 'staff', 'doctor', 'admin'];

function hasAccess(userRole: Role, requiredRole: Role) {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(requiredRole);
}

// Cached session getter for Server Components
export const getSession = cache(async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList
  });
  return session;
});

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth(requiredRole?: Role) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
    throw new Error('Unauthorized');
  }

  if (requiredRole) {
    const userRole = (session.user.role ?? 'patient') as Role;

    if (!hasAccess(userRole, requiredRole)) {
      redirect(getRoleRedirect(userRole) as Route);
    }
  }

  return session;
}

export const checkRole = async (role: Role) => {
  const session = await getSession();
  return session?.user.role?.toLowerCase() === role;
};

export const getRole = async (): Promise<Role | null> => {
  const session = await getSession();
  if (!session?.user?.role) return null;
  const role = session.user.role.toLowerCase() as Role;
  return role;
};

export async function requireRole(
  role: Role,
  options?: {
    redirectTo?: Route;
    roleRedirectTo?: Route;
  }
) {
  const session = await getSession();

  if (!session?.user) {
    redirect(options?.redirectTo ?? '/login');
  }

  const userRole = (session.user.role ?? 'patient') as Role;

  if (!hasAccess(userRole, role)) {
    redirect(options?.roleRedirectTo ?? (getRoleRedirect(userRole) as Route));
  }

  return session;
}
// Permission checking with Better Auth access control
export const hasPermission = async (): Promise<boolean> => {
  const session = await getSession();
  const role = session?.user?.role?.toLowerCase() as Role;

  const result = await auth.api.userHasPermission({
    body: {
      permissions: {
        patients: ['create']
      },
      role: role || 'patient'
    }
  });
  return result.success;
};

export const getUserId = async () => {
  const session = await getSession();
  return session?.user?.id ?? null;
};

export const getUserEmail = async () => {
  const session = await getSession();
  return session?.user?.email ?? null;
};

export const getUserName = async () => {
  const session = await getSession();
  return session?.user?.name ?? null;
};

export const getUserRole = async () => {
  const session = await getSession();
  return session?.user?.role ?? null;
};

// Dashboard access control
export const canAccessDashboard = async (): Promise<boolean> => {
  const role = await getRole();
  return role ? ['admin', 'doctor', 'staff', 'patient'].includes(role) : false;
};

export const getRoleFromSession = (session: Session | null): Role | null => {
  if (!session?.user?.role) return null;
  const role = session.user.role.toLowerCase() as Role;
  return role;
};

export type RoleChecker = {
  role: Role | null;
  isAdmin: boolean;
  isDoctor: boolean;
  isStaff: boolean;
  isPatient: boolean;
  canManagePatients: boolean;
  canCreateAppointments: boolean;
  canViewRecords: boolean;
  canManageStaff: boolean;
  hasPermission: (permissions: Record<string, string[]>) => Promise<boolean>;
};

export const createServerRoleChecker = (authInstance: typeof auth) => async (): Promise<RoleChecker | null> => {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const userRole = (session.user.role?.toLowerCase() as Role) || null;

  const [canManagePatients, canCreateAppointments, canViewRecords, canManageStaff] = await Promise.all([
    authInstance.api.userHasPermission({
      body: {
        role: userRole ?? 'admin',
        permissions: { patients: ['update'] }
      }
    }),
    authInstance.api.userHasPermission({
      body: {
        role: userRole ?? 'admin',
        permissions: { appointments: ['create'] }
      }
    }),
    authInstance.api.userHasPermission({
      body: {
        role: userRole ?? 'admin',
        permissions: { records: ['read'] }
      }
    }),
    authInstance.api.userHasPermission({
      body: {
        role: userRole ?? 'admin',
        permissions: { staff: ['update'] }
      }
    })
  ]);

  return {
    role: userRole,
    isAdmin: userRole === 'admin',
    isDoctor: userRole === 'doctor',
    isStaff: userRole === 'staff',
    isPatient: userRole === 'patient',
    canManagePatients: canManagePatients.success,
    canCreateAppointments: canCreateAppointments.success,
    canViewRecords: canViewRecords.success,
    canManageStaff: canManageStaff.success,

    hasPermission: async (permissions: Record<string, string[]>) => {
      const result = await authInstance.api.userHasPermission({
        body: {
          role: userRole ?? 'admin',
          permissions
        }
      });
      return result.success;
    }
  };
};

export const getCurrentClinic = cache(async (): Promise<Pick<Clinic, 'id' | 'name'> | null> => {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const clinicId = session.user.clinic?.id;
  if (!clinicId) {
    return null;
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId, isDeleted: false },
    select: { id: true, name: true }
  });

  return clinic;
});

export const getClinicFromHeaders = cache(async () => {
  const headersList = await headers();
  const clinicId = headersList.get('x-clinic-id');

  if (clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId, isDeleted: false },
      select: { id: true, name: true, timezone: true }
    });
    if (clinic) return clinic;
  }

  // Fallback to first clinic (development only)
  if (process.env.NODE_ENV === 'development') {
    const clinic = await prisma.clinic.findFirst({
      where: { isDeleted: false }
    });
    if (clinic) return clinic;
  }

  throw new Error('No clinic found');
});

export function getRoleRedirectPath(role?: Role | string): string {
  if (!role) return '/dashboard';

  const redirects: Record<Role, string> = {
    admin: '/admin/dashboard',
    doctor: '/doctor',
    staff: '/staff',
    patient: '/patient'
  };

  return redirects[role as Role] ?? '/dashboard';
}

// Optional: Create a pre-configured role checker instance
export const checkUserRole = createServerRoleChecker(auth);
