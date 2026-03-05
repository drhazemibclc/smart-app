import { headers } from 'next/headers';
import { cache } from 'react';

import { auth, type Role, type Session } from '@/server/auth';

import type { Clinic } from '../generated/prisma/client';
import { prisma } from '../server/db';

// Cached session getter for Server Components
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: '' // Will be populated by middleware/proxy
    })
  });
  return session;
});

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export const checkRole = async (role: Role) => {
  const session = await getSession();
  return session?.user.role?.toLowerCase() === role;
};

export const getRole = (session: Session | null): Role | null => {
  if (!session?.user?.role) return null;
  const role = session.user.role.toLowerCase() as Role;
  return role;
};

// Permission checking with Better Auth access control
export const hasPermission = async (): Promise<boolean> => {
  const result = await auth.api.userHasPermission({
    body: {
      permissions: {
        patients: ['create']
      },
      role: 'patient'
    }
  });
  return result.success;
};
// Optimized getter utilities
export const getUserId = (session: Session | null) => session?.user?.id ?? null;
export const getUserEmail = (session: Session | null) => session?.user?.email ?? null;
export const getUserName = (session: Session | null) => session?.user?.name ?? null;
export const getUserRole = (session: Session | null) => session?.user?.role ?? null;

// Dashboard access control
export const canAccessDashboard = (session: Session | null): boolean => {
  const role = getRole(session);
  return role ? ['admin', 'doctor', 'staff', 'patient'].includes(role) : false;
};
export const getRoleFromSession = (session: Session | null): Role | null => {
  if (!session?.user?.role) return null;
  const role = session.user.role.toLowerCase() as Role;
  return role;
};

type AuthInstance = typeof auth;
export const createServerRoleChecker = (auth: AuthInstance) => async (session: Session) => {
  if (!session?.user?.id) {
    return null;
  }

  const userRole = getRole(session);

  const [canManagePatients, canCreateAppointments, canViewRecords, canManageStaff] = await Promise.all([
    auth.api.userHasPermission({
      body: {
        role: userRole ?? 'admin',
        permissions: { patients: ['update'] }
      }
    }),
    auth.api.userHasPermission({
      body: {
        role: userRole ?? 'admin',
        permissions: { appointments: ['create'] }
      }
    }),
    auth.api.userHasPermission({
      body: {
        role: userRole ?? 'admin',
        permissions: { records: ['read'] }
      }
    }),
    auth.api.userHasPermission({
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
    canManagePatients,
    canCreateAppointments,
    canViewRecords,
    canManageStaff,

    hasPermission: async (permissions: Record<string, string[]>) => {
      return await auth.api.userHasPermission({
        body: {
          role: userRole ?? 'admin',
          permissions
        }
      });
    }
  };
};

export const getCurrentClinic = async (): Promise<Pick<Clinic, 'id' | 'name'> | null> => {
  const session = await auth.api.getSession({
    headers: await headers()
  });

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
  return clinic || null;
};
export const getClinicFromHeaders = cache(async (headersList?: Headers) => {
  const headersResolved = headersList || (await headers());
  const clinicId = headersResolved.get('x-clinic-id');

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
