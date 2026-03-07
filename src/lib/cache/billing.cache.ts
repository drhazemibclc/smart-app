// src/modules/billing/billing.cache.ts
'use cache';

import { cacheLife, cacheTag } from 'next/cache';

import { billingService } from '../../server/db/services/billing.service';
import type { PaymentStatus } from '../../server/db/types';
import { CACHE_TAGS } from '../tags';
import { CACHE_PROFILES } from './utils/profiles';

export async function getCachedPaymentById(id: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.billing.byId(id));
  cacheTag(CACHE_TAGS.clinic.billing(clinicId));
  cacheLife(CACHE_PROFILES.realtime); // Payments need real-time data

  return billingService.getPaymentById(id, clinicId);
}

export async function getCachedPaymentsByPatient(
  patientId: string,
  clinicId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: PaymentStatus;
  }
) {
  'use cache';

  cacheTag(CACHE_TAGS.patient.billing(patientId));
  cacheTag(CACHE_TAGS.clinic.billing(clinicId));
  cacheLife(CACHE_PROFILES.medicalShort);

  return billingService.getPaymentsByPatient(patientId,  options);
}

export async function getCachedPaymentStats(clinicId: string, startDate: Date, endDate: Date) {
  'use cache';

  cacheTag(CACHE_TAGS.clinic.stats.all);
  cacheTag(CACHE_TAGS.clinic.billing(clinicId));
  cacheLife(CACHE_PROFILES.medicalShort);

  return billingService.getPaymentStats(clinicId, startDate, endDate);
}

export async function getCachedOverduePayments(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.billing.overdue(clinicId));
  cacheTag(CACHE_TAGS.clinic.billing(clinicId));
  cacheLife(CACHE_PROFILES.realtime);

  return billingService.getOverduePayments(clinicId);
}

export async function getCachedMonthlyRevenue(clinicId: string, months?: number) {
  'use cache';

  cacheTag(CACHE_TAGS.billing.revenue(clinicId));
  cacheTag(CACHE_TAGS.clinic.billing(clinicId));
  cacheLife(CACHE_PROFILES.medicalMedium);

  return billingService.getMonthlyRevenue(clinicId, months);
}

export async function getCachedServices(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.service.byClinic(clinicId));
  cacheLife(CACHE_PROFILES.medicalMedium);

  return billingService.getServices(clinicId);
}
