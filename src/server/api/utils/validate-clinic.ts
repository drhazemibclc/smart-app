import { prisma } from '@/db/client';
import { getRole } from '@/server/api/utils/utils';
import type { auth } from '@/server/auth'; // Your Better Auth instance

type BetterAuthSession = typeof auth.$Infer.Session | null;

/**
 * 🔒 SECURITY: The "Source of Truth" Validator
 * Use this in Server Actions for any CREATE/UPDATE/DELETE.
 * It checks the DB directly to prevent session-spoofing.
 */
export async function validateClinicAccess(clinicId: string, userId: string): Promise<void> {
  const member = await prisma.clinicMember.findUnique({
    where: {
      userId_clinicId: { clinicId, userId } // Optimized if using a compound unique index
    },
    select: { userId: true }
  });

  if (!member) {
    throw new Error('Unauthorized: Access denied to this clinic.');
  }
}

/**
 * ⚡ PERFORMANCE: UI/Display Access Checker
 * Uses session data for fast UI rendering (Sidebar, Tabs).
 */
export const hasClinicAccess = (session: BetterAuthSession, clinicId: string): boolean => {
  const userClinicId = session?.user?.clinic?.id || session?.user?.clinic?.id;
  return !!(userClinicId && userClinicId === clinicId);
};

/**
 * 🧱 Permission Checker Factory
 * Modernized to reduce Better Auth API round-trips.
 */
export const createClinicPermissionChecker =
  (authInstance: typeof auth) => async (session: BetterAuthSession, clinicId: string) => {
    if (!(session?.user?.id && hasClinicAccess(session, clinicId))) {
      return null;
    }

    const userRole = getRole(session);

    // Grouping permissions into one "Check" if your Auth provider supports it,
    // otherwise, the Promise.all you had is the best approach.
    const [canManagePatients, canManageStaff, canViewRecords] = await Promise.all([
      authInstance.api.userHasPermission({
        body: { role: userRole, permissions: { patients: ['update', 'delete'] } }
      }),
      authInstance.api.userHasPermission({
        body: { role: userRole, permissions: { staff: ['create', 'update'] } }
      }),
      authInstance.api.userHasPermission({
        body: { role: userRole, permissions: { records: ['read'] } }
      })
    ]);

    return {
      clinicId,
      role: userRole,
      canManagePatients,
      canManageStaff,
      canViewRecords,
      // Helper for ad-hoc checks
      check: async (resource: string, action: string) => {
        return await authInstance.api.userHasPermission({
          body: { role: userRole, permissions: { [resource]: [action] } }
        });
      }
    };
  };
