// src/modules/appointment/appointment.actions.ts
'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/server/api/utils/index';

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
