'use cache';

import { cacheLife, cacheTag } from 'next/cache';

// ✅ Import service directly from db package
import { systemService } from '@/db/services/system.service';
import type { ChartType } from '@/db/types';

import { CACHE_PROFILES } from './utils/profiles';
import { CACHE_TAGS } from './utils/tags';

// ==================== SYSTEM CACHE ====================

/**
 * 🟢 CACHED WHO GROWTH STANDARDS
 * Profile: medicalLong - Reference data, rarely changes
 */
export async function getCachedWHOStandards(
  gender: 'MALE' | 'FEMALE',
  chartType: ChartType,
  options?: {
    minAgeDays?: number;
    maxAgeDays?: number;
    limit?: number;
  }
) {
  'use cache';

  cacheTag(CACHE_TAGS.system.whoStandards);
  cacheLife(CACHE_PROFILES.medicalLong);

  return systemService.getWHOStandards(gender, chartType, options);
}

/**
 * 🟢 CACHED GROWTH STANDARD BY AGE
 * Profile: medicalLong - Reference data, rarely changes
 */
export async function getCachedGrowthStandardByAge(gender: 'MALE' | 'FEMALE', chartType: ChartType, ageDays: number) {
  'use cache';

  cacheTag(CACHE_TAGS.system.whoByAge(gender, chartType, ageDays));
  cacheLife(CACHE_PROFILES.medicalLong);

  return systemService.getGrowthStandardByAge(gender, chartType, ageDays);
}

/**
 * 🟢 CACHED DRUG DOSAGE
 * Profile: medicalMedium - Dosage calculations
 */
export async function getCachedDrugDosage(
  drugId: string,
  patientParams: {
    weightKg?: number;
    ageDays?: number;
    bsa?: number;
    renalFunction?: number;
    hepaticFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
    pregnancy?: boolean;
    breastfeeding?: boolean;
  },
  clinicalIndication?: string
) {
  'use cache';

  cacheTag(CACHE_TAGS.drug.byId(drugId));
  cacheLife(CACHE_PROFILES.medicalMedium);

  return systemService.calculateDrugDosage(drugId, patientParams, clinicalIndication);
}

/**
 * 🟢 CACHED DRUG SEARCH RESULTS
 * Profile: medicalMedium - Search results
 */
export async function getCachedDrugSearch(query: string, limit = 20) {
  'use cache';

  cacheTag(CACHE_TAGS.drug.search(query));
  cacheLife(CACHE_PROFILES.medicalMedium);

  return systemService.searchDrugsWithDetails(query, limit);
}

/**
 * 🟢 CACHED VACCINE SCHEDULE
 * Profile: medicalLong - Reference data, rarely changes
 */
export async function getCachedVaccineSchedule() {
  'use cache';

  cacheTag(CACHE_TAGS.vaccination.schedule);
  cacheLife(CACHE_PROFILES.medicalLong);

  return systemService.warmSystemCaches().then(res => res.counts.vaccines);
}

/**
 * 🟢 CACHED DUE VACCINES FOR PATIENT
 * Profile: medicalShort - Patient-specific due vaccines
 */
export async function getCachedDueVaccines(
  patientId: string,
  dateOfBirth: Date,
  completedVaccines: Array<{
    vaccineName: string;
    date: Date;
    doseNumber: number;
  }>
) {
  'use cache';

  cacheTag(CACHE_TAGS.patient.byId(patientId));
  cacheTag(CACHE_TAGS.patient.immunizations(patientId));
  cacheLife(CACHE_PROFILES.medicalShort);

  return systemService.calculateDueVaccines(patientId, dateOfBirth, completedVaccines);
}

/**
 * 🟢 CACHED SYSTEM HEALTH
 * Profile: realtime - Health check (no caching)
 */
export async function getCachedSystemHealth() {
  'use cache';

  cacheTag(CACHE_TAGS.system.settings);
  cacheLife(CACHE_PROFILES.realtime); // Short TTL for health checks

  return systemService.getSystemHealth();
}
