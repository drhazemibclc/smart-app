'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/auth-server';
import { medicalService } from '@/server/db/services';
import {
  type CompleteEncounterInput,
  CompleteEncounterSchema,
  type DiagnosisUpdateInput,
  DiagnosisUpdateSchema
} from '@/zodSchemas';

export async function createCompleteEncounterAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = CompleteEncounterSchema.parse(input) as CompleteEncounterInput;

  try {
    // Create medical record first
    const medicalRecord = await medicalService.createMedicalRecord({
      clinicId: validated.clinicId,
      patientId: validated.patientId,
      doctorId: validated.doctorId,
      appointmentId: validated.appointmentId
    });

    // Create vital signs if provided
    if (validated.vitals && Object.values(validated.vitals).some(v => v !== undefined && v !== '')) {
      await medicalService.createVitalSigns({
        medicalId: medicalRecord.id,
        patientId: validated.patientId,
        recordedAt: validated.encounterDate,
        clinicId: validated.clinicId,
        ...validated.vitals
      });
    }

    // Update medical record with SOAP notes if provided
    if (validated.subjective || validated.objective || validated.assessment || validated.plan) {
      // This would require a service method to update medical record
      // For now, we'll skip this part
    }

    // Revalidate paths
    revalidatePath('/admin/record');
    revalidatePath(`/admin/record/${medicalRecord.id}`);
    revalidatePath(`/dashboard/patients/${validated.patientId}`);

    return {
      success: true,
      data: {
        medicalRecord
      }
    };
  } catch (error) {
    console.error('Failed to create encounter:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create encounter');
  }
}

export async function updateEncounterAction(id: string, input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const clinicId = session.user.clinic?.id;
  if (!clinicId) {
    throw new Error('Clinic ID not found');
  }

  // Validate and update diagnosis
  const validated = DiagnosisUpdateSchema.parse(input) as DiagnosisUpdateInput;
  const result = await medicalService.updateDiagnosis(id, clinicId, validated);

  revalidatePath('/admin/record');
  revalidatePath(`/admin/record/${id}`);

  return {
    success: true,
    data: result
  };
}

export async function deleteEncounterAction(id: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const clinicId = session.user.clinic?.id;
  if (!clinicId) {
    throw new Error('Clinic ID not found');
  }

  await medicalService.deleteDiagnosis(id, clinicId);

  revalidatePath('/admin/record');

  return {
    success: true
  };
}
