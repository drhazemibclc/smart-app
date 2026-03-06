// src/modules/prescription/prescription.types.ts
import type { Diagnosis, Doctor, Drug, Patient, PrescribedItem, Prescription } from '@/prisma/types';

// ==================== EXTENDED TYPES ====================
export type PrescriptionWithRelations = Prescription & {
  doctor?: Pick<Doctor, 'id' | 'name'> | null;
  patient?: Pick<Patient, 'id' | 'firstName' | 'lastName'> | null;
  encounter?: Pick<Diagnosis, 'id' | 'diagnosis'> | null;
  prescribedItems: (PrescribedItem & {
    drug: Pick<Drug, 'id' | 'name'>;
  })[];
};

export type ActivePrescriptionWithDetails = Prescription & {
  doctor?: Pick<Doctor, 'id' | 'name'> | null;
  prescribedItems: (PrescribedItem & {
    drug: Drug;
  })[];
};

// ==================== RESPONSE TYPES ====================
export interface PrescriptionListResponse {
  items: PrescriptionWithRelations[];
  total: number;
  limit: number;
  offset: number;
}

export interface PrescriptionSummary {
  id: string;
  issuedDate: Date;
  endDate?: Date | null;
  status: string;
  medicationName?: string | null;
  doctorName?: string;
  diagnosis?: string | null;
  itemCount: number;
}

// ==================== QUERY OPTIONS ====================
export interface PrescriptionQueryOptions {
  limit?: number;
  offset?: number;
  includeDoctor?: boolean;
  includeEncounter?: boolean;
  includeDrugs?: boolean;
}
export interface PrescriptionStatistics {
  /** Total count of prescriptions matching the base clinic and date filters */
  total: number;

  /** Count of prescriptions with 'active' status and an end date that has not yet passed */
  active: number;

  /** Count of prescriptions marked with 'cancelled' status */
  cancelled: number;

  /** Count of prescriptions marked with 'completed' status */
  completed: number;
}

export interface PrescriptionStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  completionRate?: number;
  activeRate?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  trends?: {
    total: number;
    active: number;
    completed: number;
  };
  previousPeriod?: {
    total: number;
    active: number;
    completed: number;
  };
}

export interface MonthlyTrend {
  month: string; // YYYY-MM format
  monthName: string; // Jan, Feb, etc.
  year: number;
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  growth: number; // Month-over-month growth percentage
}

export interface TopMedication {
  drug_name: string;
  prescription_count: number;
  unique_patients: number;
}

export interface DoctorPrescriptionStats {
  doctorId: string;
  doctorName?: string;
  total: number;
  active: number;
}

export interface PeriodComparison {
  period1: PrescriptionStats & { dateRange: { start: string; end: string } };
  period2: PrescriptionStats & { dateRange: { start: string; end: string } };
  changes: {
    total: number; // percentage
    active: number; // absolute
    completed: number; // absolute
    cancelled: number; // absolute
  };
}

export interface DashboardStats {
  current: PrescriptionStats;
  trends: MonthlyTrend[];
  topMedications: Array<{
    drugName: string;
    count: number;
    uniquePatients: number;
  }>;
  doctorStats: Array<{
    doctorId: string;
    doctorName?: string;
    total: number;
    active: number;
  }>;
  expiringSoon: number;
}
// src/types/prescription.ts (Shared types)
export interface PrescriptionItem {
  id: string;
  medicationName?: string | null;
  status: string;
  issuedDate: Date | string;
  endDate?: Date | string | null;
  instructions?: string | null;
  doctor?: {
    id: string;
    name: string | null;
  } | null;
  prescribedItems?: Array<{
    id: string;
    drug?: { id: string; name: string } | null;
  }>;
  encounter?: {
    id: string;
    diagnosis?: string | null;
  } | null;
}

// For API responses
export interface PrescriptionHistoryResponse {
  items: PrescriptionItem[];
  total: number;
  hasMore: boolean;
}
