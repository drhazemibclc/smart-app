// src/modules/prescription/prescription.cache.ts
'use cache';

import { cacheLife, cacheTag } from 'next/cache';

import { prescriptionService } from '../../server/db/services';
import { drugService } from '../../server/db/services/drug.service';
import { CACHE_TAGS } from '../tags';
import { CACHE_PROFILES } from './utils/profiles';

/**
 * 🟢 CACHE LAYER
 * - ONLY 'use cache' directives
 * - NO Prisma imports
 * - NO business logic
 * - Calls SERVICE layer (which calls QUERY layer)
 * - Uses hierarchical cache tags
 */

/**
 * Get prescription by ID
 * Cache per prescription + clinic context
 */
export async function getCachedPrescriptionById(id: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.prescription.byId(id));
  cacheTag(CACHE_TAGS.prescription.byClinic(clinicId));
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));
  cacheLife(CACHE_PROFILES.medicalShort); // 5 min stale, 10 min revalidate

  return prescriptionService.getPrescriptionById(id, clinicId);
}

/**
 * Get prescriptions by medical record
 * Cache per medical record
 */
export async function getCachedPrescriptionsByMedicalRecord(
  medicalRecordId: string,
  clinicId: string,
  options?: { limit?: number; offset?: number }
) {
  'use cache';

  cacheTag(CACHE_TAGS.prescription.byMedicalRecord(medicalRecordId));
  cacheTag(CACHE_TAGS.prescription.byClinic(clinicId));
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));
  cacheLife(CACHE_PROFILES.medicalShort);

  return prescriptionService.getPrescriptionsByMedicalRecord(medicalRecordId, clinicId, options);
}

/**
 * Get active prescriptions by patient
 * Cache per patient + needs real-time for active status
 */
export async function getCachedActivePrescriptionsByPatient(patientId: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.prescription.activeByPatient(patientId));
  cacheTag(CACHE_TAGS.prescription.byPatient(patientId));
  cacheTag(CACHE_TAGS.patient.prescriptions(patientId));
  cacheTag(CACHE_TAGS.prescription.byClinic(clinicId));
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));
  cacheLife(CACHE_PROFILES.realtime); // 10 sec stale - active prescriptions change frequently

  return prescriptionService.getPatientActivePrescriptions(patientId, clinicId);
}

/**
 * Get patient prescription history (all prescriptions, not just active)
 * Cache per patient with longer lifetime
 */
export async function getCachedPatientPrescriptionHistory(
  patientId: string,
  clinicId: string,
  options?: { limit?: number; offset?: number; includeInactive?: boolean }
) {
  'use cache';

  cacheTag(CACHE_TAGS.prescription.byPatient(patientId));
  cacheTag(CACHE_TAGS.patient.prescriptions(patientId));
  cacheTag(CACHE_TAGS.prescription.byClinic(clinicId));
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));
  cacheLife(CACHE_PROFILES.medicalMedium); // 1 hour - historical data

  return prescriptionService.getPatientPrescriptionHistory(patientId, clinicId, options);
}

/**
 * Get patient medical summary (includes prescriptions)
 * Composite cache with multiple tags
 */
export async function getCachedPatientMedicalSummary(patientId: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.patient.medicalSummary(patientId));
  cacheTag(CACHE_TAGS.patient.byId(patientId));
  cacheTag(CACHE_TAGS.patient.prescriptions(patientId));
  cacheTag(CACHE_TAGS.prescription.byPatient(patientId));
  cacheTag(CACHE_TAGS.clinic.medicalData(clinicId));
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));
  cacheLife(CACHE_PROFILES.medicalMedium); // 1 hour - summary data

  return prescriptionService.getPatientMedicalSummary(patientId, clinicId);
}

/**
 * Get all prescriptions for clinic (admin view)
 * Cache per clinic with pagination and filters
 */
export async function getCachedClinicPrescriptions(
  clinicId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: 'active' | 'completed' | 'cancelled';
    startDate?: Date;
    endDate?: Date;
  }
) {
  'use cache';

  cacheTag(CACHE_TAGS.prescription.byClinic(clinicId));
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));

  // Add status tag if filtering by status
  if (options?.status) {
    cacheTag(CACHE_TAGS.prescription.byStatus(options.status));
  }

  // Add date range tag if filtering by date
  if (options?.startDate && options?.endDate) {
    const fromStr = options.startDate.toISOString().split('T')[0];
    const toStr = options.endDate.toISOString().split('T')[0];
    cacheTag(CACHE_TAGS.prescription.byDate(`${fromStr}:${toStr}`));
  }

  cacheLife(CACHE_PROFILES.medicalMedium);

  return prescriptionService.getClinicPrescriptions(clinicId, options);
}

/**
 * Get prescription count for clinic dashboard
 * Lightweight count query
 */
export async function getCachedPrescriptionCount(clinicId: string, status?: 'active' | 'completed' | 'cancelled') {
  'use cache';

  cacheTag(CACHE_TAGS.clinic.counts(clinicId));
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));
  cacheTag(CACHE_TAGS.prescription.byClinic(clinicId));

  if (status) {
    cacheTag(CACHE_TAGS.prescription.byStatus(status));
  }

  cacheLife(CACHE_PROFILES.realtime); // Counts need to be fresh for dashboards

  return prescriptionService.getPrescriptionCount(clinicId, status);
}

/**
 * Get prescriptions expiring soon (for notifications)
 * Cache per clinic with short lifetime
 */
export async function getCachedPrescriptionsExpiringSoon(clinicId: string, daysThreshold = 7) {
  'use cache';

  cacheTag(CACHE_TAGS.prescription.byClinic(clinicId));
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));
  cacheTag(`prescriptions:expiring:${daysThreshold}:${clinicId}`);
  cacheLife(CACHE_PROFILES.realtime); // Expiring prescriptions need to be accurate

  return prescriptionService.getPrescriptionsExpiringSoon(clinicId, daysThreshold);
}

/**
 * Get prescription statistics for clinic
 * Aggregated data with longer cache
 */
export async function getCachedPrescriptionStats(clinicId: string, startDate?: Date, endDate?: Date) {
  'use cache';

  cacheTag(CACHE_TAGS.clinic.stats.all);
  cacheTag(CACHE_TAGS.clinic.prescriptions(clinicId));
  cacheTag(CACHE_TAGS.prescription.byClinic(clinicId));

  if (startDate && endDate) {
    const fromStr = startDate.toISOString().split('T')[0];
    const toStr = endDate.toISOString().split('T')[0];
    cacheTag(`prescriptions:stats:${fromStr}:${toStr}:${clinicId}`);
  }

  cacheLife(CACHE_PROFILES.medicalMedium);

  // You'll need to implement this method in your service if needed
  return prescriptionService.getPrescriptionStats?.(clinicId, startDate, endDate);
}

export async function getCachedPrescriptionStatsByDateRange(clinicId: string, startDate: Date, endDate: Date) {
  'use cache';

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  cacheTag(CACHE_TAGS.prescription.stats.byDate(clinicId, `${startStr}:${endStr}`));
  cacheTag(CACHE_TAGS.prescription.stats.byClinic(clinicId));
  cacheTag(CACHE_TAGS.clinic.stats.prescriptions(clinicId));

  cacheLife(CACHE_PROFILES.stats.hourly);

  return prescriptionService.getPrescriptionStatsByDateRange(clinicId, startDate, endDate);
}

export async function getCachedPrescriptionMonthlyTrends(clinicId: string, months = 12) {
  'use cache';

  cacheTag(CACHE_TAGS.prescription.stats.byClinic(clinicId));
  cacheTag(`prescriptions:trends:${months}:${clinicId}`);

  cacheLife(CACHE_PROFILES.stats.daily);

  return prescriptionService.getPrescriptionMonthlyTrends(clinicId, months);
}
// ==================== DRUG CACHE ====================

/**
 * 🟢 CACHED DRUG DATABASE
 * Profile: medicalLong - Drug catalog doesn't change frequently
 * Tags: Hierarchical drug database tags for invalidation
 */
export async function getCachedDrugDatabase(clinicId?: string) {
  'use cache';

  // Add tags for cache invalidation
  cacheTag(CACHE_TAGS.drug.all);
  cacheTag(CACHE_TAGS.drug.active);

  if (clinicId) {
    cacheTag(CACHE_TAGS.drug.byClinic(clinicId));
  }

  // Long cache since drug data rarely changes
  cacheLife(CACHE_PROFILES.medicalLong);

  // You'll need to import drugService at the top
  return drugService.getDrugDatabase();
}

/**
 * 🟢 CACHED DRUG BY ID
 * Profile: medicalMedium - Individual drug details
 */
export async function getCachedDrugById(id: string, clinicId?: string) {
  'use cache';

  cacheTag(CACHE_TAGS.drug.byId(id));
  cacheTag(CACHE_TAGS.drug.all);

  if (clinicId) {
    cacheTag(CACHE_TAGS.drug.byClinic(clinicId));
  }

  cacheLife(CACHE_PROFILES.medicalMedium);

  return drugService.getDrugById(id);
}

/**
 * 🟢 CACHED DRUG CATEGORIES
 * Profile: medicalLong - Categories change infrequently
 */
export async function getCachedDrugCategories(clinicId?: string) {
  'use cache';

  cacheTag(CACHE_TAGS.drug.categories);

  if (clinicId) {
    cacheTag(CACHE_TAGS.drug.byClinic(clinicId));
  }

  cacheLife(CACHE_PROFILES.medicalLong);

  return drugService.getDrugCategories();
}

/**
 * 🟢 CACHED ACTIVE DRUGS
 * Profile: medicalMedium - Active medications list
 */
export async function getCachedActiveDrugs(clinicId?: string) {
  'use cache';

  cacheTag(CACHE_TAGS.drug.active);
  cacheTag(CACHE_TAGS.drug.all);

  if (clinicId) {
    cacheTag(CACHE_TAGS.drug.byClinic(clinicId));
  }

  cacheLife(CACHE_PROFILES.medicalMedium);

  return drugService.getActiveDrugs();
}

/**
 * 🟢 CACHED DRUG SEARCH
 * Profile: realtime - Search results need to be fresh
 */
export async function getCachedDrugSearch(query: string, clinicId?: string) {
  'use cache';

  cacheTag(CACHE_TAGS.drug.search(query));
  cacheTag(CACHE_TAGS.drug.all);

  if (clinicId) {
    cacheTag(CACHE_TAGS.drug.byClinic(clinicId));
  }

  cacheLife(CACHE_PROFILES.realtime);

  return drugService.searchDrugs(query);
}

/**
 * 🟢 CACHED DRUG FORMULARY
 * Profile: medicalMedium - Clinic-specific formulary
 */
export async function getCachedDrugFormulary(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.drug.formulary(clinicId));
  cacheTag(CACHE_TAGS.drug.byClinic(clinicId));
  cacheTag(CACHE_TAGS.drug.active);

  cacheLife(CACHE_PROFILES.medicalMedium);

  return drugService.getClinicFormulary(clinicId);
}
