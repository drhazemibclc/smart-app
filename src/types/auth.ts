// types/auth.ts

import type { auth } from '@/server/auth';

// Infer types from Better Auth instance
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Role type - normalize to lowercase for consistency
// Database role type (as stored in Prisma)
export type UserRole = 'ADMIN' | 'STAFF' | 'DOCTOR' | 'PATIENT';

// Application role type (normalized)
export type Role = 'admin' | 'staff' | 'doctor' | 'patient';

// Utility function to convert between them
export const normalizeRole = (role: UserRole | Role | undefined): Role | undefined => {
  return role?.toLowerCase() as Role | undefined;
};

export const toDatabaseRole = (role: Role | undefined): UserRole | undefined => {
  return role?.toUpperCase() as UserRole | undefined;
};
// Extended user type with additional fields
export interface ExtendedUser extends User {
  role: UserRole;
  clinic: {
    id: string;
    name: string;
  };
  isAdmin: boolean;
  phone?: string | null;
}

// Extended session type
export interface ExtendedSession {
  user: ExtendedUser;
  session: Session;
}

// Auth context types for your session provider
export type AuthContextType = {
  data: ExtendedSession | null;
  isPending: boolean;
  error: Error | null;
  user: ExtendedUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  role: UserRole | undefined;
  isAdmin: boolean;
  isDoctor: boolean;
  isStaff: boolean;
  isPatient: boolean;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
};
