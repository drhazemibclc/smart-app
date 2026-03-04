/**
 * 🟠 VACCINATION MODULE - ACTION LAYER
 *
 * RESPONSIBILITIES:
 * - Server Actions for mutations
 * - Authentication only
 * - Zod validation only
 * - NO business logic
 * - NO database calls
 * - Delegates to service layer
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { getSession } from '@/server/api/utils/index';

import type { ImmunizationCreateInput, ImmunizationUpdateInput } from '../server/db';
import { vaccinationService } from '../server/db/services';
import type { ImmunizationStatus } from '../server/db/types';
import {
  type DeleteImmunizationInput,
  DeleteImmunizationSchema,
  ImmunizationCreateSchema,
  ImmunizationUpdateSchema,
  ScheduleVaccinationSchema,
  VaccinationByIdSchema
} from '../zodSchemas';

// ==================== CREATE ACTIONS ====================

export async function recordImmunizationAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = ImmunizationCreateSchema.parse(input);

  const result = await vaccinationService.recordImmunization(validated as ImmunizationCreateInput, session.user.id);

  revalidatePath(`/dashboard/patients/${validated.patientId}/immunizations`);
  revalidatePath('/dashboard/immunizations');
  revalidatePath('/dashboard');

  return {
    success: true,
    data: result
  };
}

export async function scheduleVaccinationAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = ScheduleVaccinationSchema.parse(input);

  const result = await vaccinationService.scheduleVaccination(
    validated.patientId,
    validated.vaccineName,
    validated.dueDate,
    session.user.clinic?.id ?? ''
  );

  revalidatePath(`/dashboard/patients/${validated.patientId}/immunizations`);
  revalidatePath('/dashboard/immunizations/upcoming');
  revalidatePath('/dashboard');

  return {
    success: true,
    data: result
  };
}

// ==================== UPDATE ACTIONS ====================

export async function updateImmunizationAction(clinicId: string, input: ImmunizationUpdateInput) {
  const validated = ImmunizationUpdateSchema.parse({ ...input });

  const result = await vaccinationService.updateImmunization(validated.id, clinicId, validated);

  revalidatePath(`/dashboard/patients/${result.patientId}/immunizations`);
  revalidatePath('/dashboard/immunizations');

  return {
    success: true,
    data: result
  };
}

export async function updateImmunizationStatusAction(id: string, clinicId: string, status: ImmunizationStatus) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = VaccinationByIdSchema.parse({ id });

  const result = await vaccinationService.updateImmunizationStatus(validated.id, clinicId, status);

  revalidatePath(`/dashboard/patients/${result.patientId}/immunizations`);
  revalidatePath('/dashboard/immunizations');

  return {
    success: true,
    data: result
  };
}

export async function completeImmunizationAction(id: string, clinicId: string) {
  return updateImmunizationStatusAction(id, clinicId, 'COMPLETED');
}

export async function delayImmunizationAction(id: string, notes?: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const result = await vaccinationService.updateImmunization(id, session.user.clinic?.id ?? '', { notes });

  revalidatePath(`/dashboard/patients/${result.patientId}/immunizations`);
  revalidatePath('/dashboard/immunizations/overdue');

  return {
    success: true,
    data: result
  };
}

// ==================== BULK ACTIONS ====================

export async function scheduleDueVaccinationsAction(patientId: string, clinicId: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const dueVaccinations = await vaccinationService.calculateDueVaccinesForPatient(patientId, clinicId);

  const results = await Promise.all(
    dueVaccinations.dueVaccines.map(v =>
      vaccinationService
        .scheduleVaccination(patientId, v.vaccineName, v.dueDate, session.user.id)
        .catch(e => ({ error: e.message, vaccine: v.vaccineName }))
    )
  );

  revalidatePath(`/dashboard/patients/${patientId}/immunizations`);
  revalidatePath('/dashboard/immunizations/upcoming');

  const failedResults = results.filter(
    (r: unknown): r is { error: string; vaccine: string } => typeof r === 'object' && r !== null && 'error' in r
  );

  return {
    success: true,
    scheduled: results.length - failedResults.length,
    failed: failedResults,
    total: dueVaccinations.dueVaccines.length
  };
}

// ==================== DELETE ACTIONS ====================

export async function deleteImmunizationAction(input: DeleteImmunizationInput) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  // const userId = session.user.id;

  // 1. Validate Input
  const { id, clinicId, patientId } = DeleteImmunizationSchema.parse(input);

  // 2. Delegate to Service
  const result = await vaccinationService.deleteImmunization(id, clinicId);

  // 3. Revalidate
  revalidatePath(`/dashboard/patients/${patientId}`);
  revalidatePath(`/dashboard/clinics/${clinicId}/immunizations`);
  revalidateTag(`vaccination-patient-${patientId}`, 'max');

  return {
    success: true,
    data: result
  };
}

// ==================== UTILITY ACTIONS ====================

/**
 * Triggered when a nurse/doctor wants to manually refresh the
 * "Due Vaccines" calculation for a specific patient.
 */
export async function refreshPatientVaccineStatusAction(patientId: string, _clinicId: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // No mutation here, just breaking the cache
  revalidateTag(`vaccination-patient-${patientId}`, 'max');
  revalidatePath(`/dashboard/patients/${patientId}`);

  return { success: true };
}
