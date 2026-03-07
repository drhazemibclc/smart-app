// src/modules/appointment/appointment.actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { getSession } from '@/lib/auth-server';

import { appointmentService } from '../server/db/services';
import { AppointmentCreateSchema, AppointmentDeleteSchema, AppointmentUpdateStatusSchema } from '../zodSchemas';

export async function createAppointmentAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = AppointmentCreateSchema.parse(input);

  const appointment = await appointmentService.createAppointment(validated, session.user.id);

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/calendar');

  return { success: true, data: appointment };
}

export async function updateAppointmentStatusAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = AppointmentUpdateStatusSchema.parse(input);

  const appointment = await appointmentService.updateAppointmentStatus(validated, session.user.id);

  revalidatePath('/dashboard/appointments');

  return { success: true, data: appointment };
}

export async function deleteAppointmentAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = AppointmentDeleteSchema.parse(input);

  await appointmentService.deleteAppointment(validated.id, validated.clinicId, session.user.id);

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/calendar');

  return { success: true };
}

export async function invalidateAppointmentCascade(
  clinicId: string,
  doctorId?: string,
  patientId?: string,
  appointmentId?: string,
  options?: {
    includeReminders?: boolean;
    includeFinancial?: boolean;
  }
) {
  const today = new Date().toISOString().split('T')[0];
  const opts = { includeReminders: true, includeFinancial: false, ...options };

  // Clinic-level caches
  revalidateTag(`clinic-stats-${clinicId}`, 'max');
  revalidateTag(`dashboard-${clinicId}`, 'max');
  revalidateTag(`today-appointments-${clinicId}`, 'max');

  // Doctor-specific caches
  if (doctorId) {
    revalidateTag(`doctor-stats-${doctorId}`, 'max');
    revalidateTag(`doctor-schedule-${doctorId}-${today}`, 'max');
    revalidateTag(`working_days_doctor_active_idx-${doctorId}`, 'max');
    revalidateTag(`ratings_doctor_avg_idx-${doctorId}`, 'max');
  }

  // Patient-specific caches
  if (patientId) {
    revalidateTag(`patient-overview-${patientId}`, 'max');
    revalidateTag(`appointments_patient_date_idx-${patientId}`, 'max');
    revalidateTag(`vital_signs_patient_timeline_idx-${patientId}`, 'max');
    revalidateTag(`prescriptions_patient_active_idx-${patientId}`, 'max');
  }

  // Appointment-specific
  if (appointmentId) {
    revalidateTag(`encounters_appointment_idx-${appointmentId}`, 'max');
    revalidateTag(`medical_records_appointment_idx-${appointmentId}`, 'max');
  }

  // Related caches
  if (opts.includeReminders) {
    revalidateTag('reminders_pending_idx', 'max');
    revalidateTag('reminders_appointment_idx', 'max');
  }

  if (opts.includeFinancial || appointmentId) {
    revalidateTag('billing_transactions_appointment_idx', 'max');
    revalidateTag('payments_appointment_idx', 'max');
  }
}

export async function onAppointmentCreated(clinicId: string, doctorId?: string, patientId?: string) {
  await invalidateAppointmentCascade(clinicId, doctorId, patientId, undefined, {
    includeReminders: true
  });
}

export async function onAppointmentUpdated(
  clinicId: string,
  appointmentId?: string,
  doctorId?: string,
  patientId?: string,
  options?: { statusChanged?: boolean; dateChanged?: boolean }
) {
  await invalidateAppointmentCascade(clinicId, doctorId, patientId, appointmentId, {
    includeReminders: true,
    includeFinancial: options?.statusChanged
  });

  if (options?.dateChanged && doctorId) {
    const today = new Date().toISOString().split('T')[0];
    revalidateTag(`doctor-schedule-${doctorId}-${today}`, 'max');
  }
}
