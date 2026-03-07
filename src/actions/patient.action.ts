// src/modules/patient/patient.actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { getSession } from '@/lib/auth-server';

import { patientService } from '../server/db/services';
import { CreatePatientSchema, DeletePatientSchema, UpdatePatientSchema, UpsertPatientSchema } from '../zodSchemas';

/**
 * 🟠 ACTION LAYER
 * - ONLY auth and validation
 * - NO business logic
 * - NO database calls
 * - Delegates to service layer
 */
export async function createPatientAction(input: unknown) {
  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // 2. Validation
  const validated = CreatePatientSchema.parse(input);

  // 3. Delegate to service
  const patient = await patientService.createPatient(
    { ...validated, clinicId: session.user?.clinic?.id ?? '' },
    session.user.id
  );

  // 4. Revalidate UI paths
  revalidatePath('/dashboard/patients');
  revalidatePath('/dashboard');

  return { success: true, data: patient };
}

export async function updatePatientAction(id: string, input: unknown) {
  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // 2. Validation
  const validated = UpdatePatientSchema.parse(input);

  // 3. Delegate to service
  const patient = await patientService.updatePatient(id, session.user?.clinic?.id ?? '', validated);

  // 4. Revalidate UI paths
  revalidatePath(`/dashboard/patients/${id}`);
  revalidatePath('/dashboard/patients');

  return { success: true, data: patient };
}

export async function deletePatientAction(id: string) {
  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // 2. Validation
  DeletePatientSchema.parse({ id });

  // 3. Delegate to service
  await patientService.deletePatient(id, session.user.id);

  // 4. Revalidate UI paths
  revalidatePath('/dashboard/patients');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function upsertPatientAction(input: unknown) {
  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // 2. Validation
  const validated = UpsertPatientSchema.parse(input);

  // 3. Delegate to service
  const patient = await patientService.createPatient(
    { ...validated, clinicId: session.user?.clinic?.id ?? '' },
    session.user.id
  );

  // 4. Revalidate UI paths
  revalidatePath('/dashboard/patients');

  return { success: true, data: patient };
}

export async function onPatientStatusChanged(patientId: string, clinicId: string, newStatus: string) {
  await invalidatePatientCascade(patientId, clinicId, {
    includeAppointments: newStatus !== 'ACTIVE',
    includeFinancial: true
  });

  if (newStatus !== 'ACTIVE') {
    revalidateTag(`patients_clinic_active_idx-${clinicId}`, 'max');
  }
}

export async function invalidatePatientCascade(
  patientId: string,
  clinicId: string,
  options?: {
    includeAppointments?: boolean;
    includeFinancial?: boolean;
    includeGuardians?: boolean;
  }
) {
  const opts = {
    includeAppointments: true,
    includeFinancial: true,
    includeGuardians: true,
    ...options
  };

  // Patient data caches
  revalidateTag(`patient-overview-${patientId}`, 'max');
  revalidateTag(`patient-growth-${patientId}`, 'max');
  revalidateTag(`medical_records_patient_date_idx-${patientId}`, 'max');
  revalidateTag(`encounters_patient_timeline_idx-${patientId}`, 'max');
  revalidateTag(`immunizations_patient_schedule_idx-${patientId}`, 'max');
  revalidateTag(`vital_signs_patient_timeline_idx-${patientId}`, 'max');
  revalidateTag(`growth_records_patient_chart_idx-${patientId}`, 'max');
  revalidateTag(`feeding_logs_patient_daily_idx-${patientId}`, 'max');
  revalidateTag(`lab_tests_patient_date_idx-${patientId}`, 'max');
  revalidateTag(`developmental_checks_patient_timeline_idx-${patientId}`, 'max');

  // Related entities
  if (opts.includeGuardians) {
    revalidateTag(`patient_guardians_patient_primary_idx-${patientId}`, 'max');
  }

  // Clinic-level caches
  revalidateTag(`patients_clinic_active_idx-${clinicId}`, 'max');
  revalidateTag(`recent-patients-${clinicId}`, 'max');

  if (opts.includeAppointments) {
    revalidateTag(`appointments_patient_date_idx-${patientId}`, 'max');
    revalidateTag(`today-appointments-${clinicId}`, 'max');
  }

  if (opts.includeFinancial) {
    revalidateTag(`billing_transactions_patient_status_idx-${patientId}`, 'max');
    revalidateTag(`payments_patient_status_idx-${patientId}`, 'max');
    revalidateTag(`financial-overview-${clinicId}`, 'max');
  }

  // Search and listing caches
  revalidateTag(`patients_lookup_idx-${clinicId}`, 'max');
  revalidateTag(`patients_name_search_idx-${clinicId}`, 'max');
}

export async function invalidatePatientSearchCascade(clinicId: string, patientId?: string) {
  revalidateTag(`patients_lookup_idx-${clinicId}`, 'max');
  revalidateTag(`patients_name_search_idx-${clinicId}`, 'max');

  if (patientId) {
    // Clear specific patient from search results
    revalidateTag(`patient_search_${clinicId}_${patientId}`, 'max');
  }
}

export async function invalidateDoctorSearchCascade(clinicId: string, doctorId?: string) {
  revalidateTag(`doctors_listing_idx-${clinicId}`, 'max');
  revalidateTag(`doctors_clinic_active_idx-${clinicId}`, 'max');

  if (doctorId) {
    revalidateTag(`doctor_search_${clinicId}_${doctorId}`, 'max');
  }
}

// =========== SPECIALIZED INVALIDATION ===========

export async function invalidateGrowthAndDevelopmentCascade(patientId: string) {
  revalidateTag(`patient-growth-${patientId}`, 'max');
  revalidateTag(`growth_records_patient_chart_idx-${patientId}`, 'max');
  revalidateTag(`developmental_checks_patient_timeline_idx-${patientId}`, 'max');
  revalidateTag(`feeding_logs_patient_daily_idx-${patientId}`, 'max');
}

export async function invalidateImmunizationsCascade(patientId: string, clinicId: string) {
  revalidateTag(`immunizations_patient_schedule_idx-${patientId}`, 'max');
  revalidateTag(`immunizations_history_idx-${patientId}`, 'max');
  revalidateTag(`immunizations_due_idx-${clinicId}`, 'max');
}

// =========== EVENT-BASED HANDLERS ===========

export async function onPatientCreated(patientId: string, clinicId: string) {
  await invalidatePatientCascade(patientId, clinicId);
  revalidateTag(`clinic-stats-${clinicId}`, 'max');
}

export async function onPatientUpdated(
  patientId: string,
  clinicId: string,
  options?: { contactInfoChanged?: boolean }
) {
  await invalidatePatientCascade(patientId, clinicId, {
    includeFinancial: true,
    includeGuardians: true
  });

  if (options?.contactInfoChanged) {
    revalidateTag(`patient_guardians_patient_primary_idx-${patientId}`, 'max');
  }
}
