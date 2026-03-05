/**
 * 🟠 VISIT MODULE - ACTION LAYER
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

import { getSession } from '@/lib/auth-server';

import { visitService } from '../server/db/services';
import type { AppointmentStatus } from '../server/db/types';
import { VisitByIdSchema, VisitCreateSchema, type VisitUpdateInput, VisitUpdateSchema } from '../zodSchemas';

// ==================== CREATE ACTIONS ====================

export async function createVisitAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = VisitCreateSchema.parse(input);

  const result = await visitService.createVisit(
    {
      ...validated,
      clinicId: validated.clinicId ?? session.user?.clinic?.id ?? ''
    },
    session.user?.clinic?.id ?? ''
  );

  revalidatePath(`/dashboard/patients/${validated.patientId}`);
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');

  return {
    success: true,
    data: result
  };
}

// ==================== UPDATE ACTIONS ====================

export async function updateVisitAction(id: string, input: VisitUpdateInput) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = VisitUpdateSchema.parse({ ...input });

  const result = await visitService.updateVisit(id, validated as VisitUpdateInput);

  revalidatePath(`/dashboard/patients/${result.patientId}`);
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');

  return {
    success: true,
    data: result
  };
}

// ==================== STATUS UPDATE ACTIONS ====================

export async function updateVisitStatusAction(id: string, status: AppointmentStatus) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = VisitByIdSchema.parse({ id });

  const result = await visitService.updateVisitStatus(validated.id, status, session.user.id);

  revalidatePath(`/dashboard/patients/${result.patientId}`);
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');

  return {
    success: true,
    data: result
  };
}

export async function cancelVisitAction(id: string) {
  return updateVisitStatusAction(id, 'CANCELLED');
}

export async function completeVisitAction(id: string) {
  return updateVisitStatusAction(id, 'COMPLETED');
}

export async function rescheduleVisitAction(id: string, appointmentDate: Date, time?: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const result = await visitService.updateVisit(id, {
    appointmentDate,
    time: time || '',
    serviceId: { id: '' },
    id: ''
  });

  revalidatePath(`/dashboard/patients/${result.patientId}`);
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');

  return {
    success: true,
    data: result
  };
}
