// types/staff.ts
export interface Staff {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  department: string | null;
  status: Status | null;
  clinicId: string | null;
  avatar?: string;
  hireDate: Date | null;
  updatedAt?: Date;
  address?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
  emergencyContact?: string | null;
  notes?: string | null;
  user?: { email: string; createdAt: Date } | null;
  [key: string]: string | number | boolean | Date | null | undefined | object; // <-- this makes it compatible with DataTable and Prisma models
}
export type UserRole = 'ADMIN' | 'STAFF' | 'DOCTOR' | 'PATIENT';
export type Status = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'DORMANT';
