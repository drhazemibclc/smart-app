/**
 * 🟠 MEDICAL MODULE - ACTION LAYER
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

import { revalidatePath } from 'next/cache';

import { cacheHelpers } from '@/lib/cache/utils/helpers';
import { getSession } from '@/server/api/utils/index';

import { medicalService } from '../server/db';
import { labTestService, vitalService } from '../server/db/services';
import {
  type DiagnosisCreateInput,
  DiagnosisCreateSchema,
  type DiagnosisUpdateInput,
  DiagnosisUpdateSchema,
  type LabTestCreateInput,
  LabTestCreateSchema,
  type LabTestUpdateInput,
  LabTestUpdateSchema,
  MedicalRecordCreateSchema,
  VitalSignsCreateSchema,
  type VitalSignsUpdateInput,
  VitalSignsUpdateSchema
} from '../zodSchemas';

// ==================== DIAGNOSIS ACTIONS ====================

export async function createDiagnosisAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = DiagnosisCreateSchema.parse(input);

  const result = await medicalService.createDiagnosis(validated as DiagnosisCreateInput);

  revalidatePath(`/dashboard/patients/${validated.patientId}`);
  revalidatePath('/dashboard/medical-records');

  return {
    success: true,
    data: result
  };
}

export async function createVitalSignsAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = VitalSignsCreateSchema.parse(input);

  // Add clinicId from session if not provided
  const inputWithClinic = {
    ...validated,
    clinicId: session.user.clinic?.id
  };

  const result = await medicalService.createVitalSigns({
    ...inputWithClinic,
    medicalId: validated.medicalId ?? '',
    clinicId: inputWithClinic.clinicId ?? '',
    patientId: validated.patientId
  });

  // Revalidate paths
  revalidatePath(`/dashboard/patients/${validated.patientId}`);
  revalidatePath(`/dashboard/medical-records/${validated.medicalId}`);
  revalidatePath('/dashboard/vitals');

  return {
    success: true,
    data: result
  };
}

export async function updateVitalSignsAction(input: VitalSignsUpdateInput) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = VitalSignsUpdateSchema.parse(input);

  const result = await vitalService.updateVitalSigns(session.user.id, session.user.clinic?.id ?? '', validated);

  // Revalidate paths
  revalidatePath(`/dashboard/patients/${result.patientId}`);
  revalidatePath(`/dashboard/medical-records/${result.medicalId}`);
  revalidatePath('/dashboard/vitals');

  return {
    success: true,
    data: result
  };
}

export async function deleteVitalSignsAction(_id: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Implementation would need service method
  // const result = await medicalService.deleteVitalSigns(id, session.user.id);

  revalidatePath('/dashboard/vitals');

  return {
    success: true
  };
}

export async function updateDiagnosisAction(input: DiagnosisUpdateInput) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = DiagnosisUpdateSchema.parse({ ...input });

  const result = await medicalService.updateDiagnosis(session.user.id, session.user.clinic?.id ?? '', validated);

  revalidatePath(`/dashboard/patients/${result.patientId}`);
  revalidatePath('/dashboard/medical-records');

  return {
    success: true,
    data: result
  };
}

// ==================== MEDICAL RECORDS ACTIONS ====================

export async function createMedicalRecordAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = MedicalRecordCreateSchema.parse(input);

  const result = await medicalService.createMedicalRecord(validated);

  revalidatePath(`/dashboard/patients/${validated.patientId}`);
  revalidatePath('/dashboard/medical-records');

  return {
    success: true,
    data: result
  };
}

// ==================== LAB TESTS ACTIONS ====================

export async function createLabTestAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = LabTestCreateSchema.parse(input);

  const result = await medicalService.createLabTest({
    ...(validated as LabTestCreateInput),
    clinicId: session.user.clinic?.id ?? ''
  });

  revalidatePath(`/dashboard/patients/${result.medicalRecord?.patientId}`);
  revalidatePath('/dashboard/lab-tests');

  return {
    success: true,
    data: result
  };
}

export async function updateLabTestAction(input: LabTestUpdateInput) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = LabTestUpdateSchema.parse({ ...input });

  const result = await labTestService.updateLabTest(session.user.id, session.user.clinic?.id ?? '', validated);

  revalidatePath(`/dashboard/patients/${result.medicalRecord?.patientId}`);
  revalidatePath('/dashboard/lab-tests');

  return {
    success: true,
    data: result
  };
}

// ==================== BULK INVALIDATION ACTIONS ====================

export async function invalidateMedicalCacheAction(params: {
  patientId: string;
  clinicId: string;
  options?: {
    includeVitals?: boolean;
    includePrescriptions?: boolean;
    includeLabTests?: boolean;
  };
}) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  cacheHelpers.patient.invalidateMedical(params.patientId, params.clinicId);

  if (params.options?.includeVitals) {
    cacheHelpers.patient.invalidateVitals(params.patientId, params.clinicId);
  }

  if (params.options?.includePrescriptions) {
    cacheHelpers.patient.invalidatePrescriptions(params.patientId, params.clinicId);
  }

  if (params.options?.includeLabTests) {
    cacheHelpers.medical.lab.invalidatePatientLabTests(params.patientId, params.clinicId);
  }

  return { success: true };
}
