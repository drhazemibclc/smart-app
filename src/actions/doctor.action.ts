// modules/doctor/doctor.actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { getSession } from '@/lib/auth-server';
import { CreateDoctorSchema, DeleteDoctorSchema } from '@/zodSchemas/doctor.schema';

import { db } from '../server/db';
import { doctorService } from '../server/db/services';

/**
 * 🟠 ACTION LAYER
 * - Auth only
 * - Validation only
 * - NO business logic
 * - NO database calls
 * - Delegates to service
 */

export async function upsertDoctorAction(input: unknown) {
  // 1. Auth
  const session = await getSession();
  if (!session?.user?.clinic?.id) {
    throw new Error('Unauthorized: No clinic access');
  }

  // 2. Validation
  const validated = CreateDoctorSchema.parse(input);

  // 3. Delegate to service
  const doctor = await doctorService.upsertDoctor(validated, session.user.clinic.id, session.user.id);

  // 4. UI revalidation (cache invalidation already handled in service)
  revalidatePath('/dashboard/doctors');
  if (validated.id) {
    revalidatePath(`/dashboard/doctors/${validated.id}`);
  }

  return { success: true, data: doctor };
}

export async function deleteDoctorAction(input: unknown) {
  try {
    // 1. Auth
    const session = await getSession();
    const clinicId = session?.user?.clinic?.id;
    if (!clinicId) {
      throw new Error('Unauthorized: No clinic access');
    }

    const validated = DeleteDoctorSchema.parse(input);

    const doctor = await db.doctor.findFirst({
      where: {
        id: validated.id,
        clinicId,
        isDeleted: false
      }
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Soft delete the doctor
    await db.doctor.update({
      where: { id: validated.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false
      }
    });

    // 3. Delegate to service
    const result = await doctorService.deleteDoctor(validated.id, clinicId, session.user.id);

    // 4. UI revalidation
    revalidatePath('/dashboard/doctors');
    revalidatePath('/dashboard/admin');

    return { result, success: true };
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete doctor');
  }
}

export async function getDoctorByIdAction(id: string) {
  // 1. Auth
  const session = await getSession();
  if (!session?.user?.clinic?.id) {
    throw new Error('Unauthorized: No clinic access');
  }

  // 2. Delegate to cached service
  const { getCachedDoctorById } = await import('@/lib/cache/doctor.cache');
  const doctor = await getCachedDoctorById(id, session.user.clinic.id);

  return { success: true, data: doctor };
}

export async function invalidateDoctorCascade(
  doctorId: string,
  clinicId: string,
  options?: {
    includeSchedule?: boolean;
    includeAppointments?: boolean;
    includePatients?: boolean;
  }
) {
  const opts = {
    includeSchedule: true,
    includeAppointments: true,
    includePatients: false,
    ...options
  };

  // Doctor-specific caches
  revalidateTag(`doctor-stats-${doctorId}`, 'max');
  revalidateTag(`ratings_doctor_avg_idx-${doctorId}`, 'max');
  revalidateTag(`doctors_clinic_active_idx-${clinicId}`, 'max');

  // Schedule-related
  if (opts.includeSchedule) {
    const today = new Date().toISOString().split('T')[0];
    revalidateTag(`doctor-schedule-${doctorId}-${today}`, 'max');
    revalidateTag(`working_days_doctor_active_idx-${doctorId}`, 'max');
    revalidateTag(`working_days_schedule_idx-${doctorId}`, 'max');
  }

  // Appointment-related
  if (opts.includeAppointments) {
    revalidateTag(`appointments_doctor_date_idx-${doctorId}`, 'max');
    revalidateTag(`encounters_doctor_schedule_idx-${doctorId}`, 'max');
    revalidateTag(`today-appointments-${clinicId}`, 'max');
    revalidateTag(`clinic-stats-${clinicId}`, 'max');
  }

  // Patient-related if doctor's patient list affected
  if (opts.includePatients) {
    revalidateTag(`medical_records_doctor_patient_idx-${doctorId}`, 'max');
    revalidateTag(`prescriptions_doctor_patient_idx-${doctorId}`, 'max');
  }

  // Search and listing caches
  revalidateTag(`doctors_listing_idx-${clinicId}`, 'max');
}
