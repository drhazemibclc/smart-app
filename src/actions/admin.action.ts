'use server';

import { revalidatePath } from 'next/cache'; // ✅ For UI revalidation

import { cacheHelpers } from '@/lib/cache/utils/helpers';
import { getSession } from '@/server/api/utils/index';

import { toNumber } from '../lib/decimal';
import { adminService } from '../server/db/services';
import { CreateDoctorSchema, ServicesSchema, StaffAuthSchema, type UpdateServiceInput } from '../zodSchemas';

/**
 * 🟠 ADMIN SERVER ACTIONS
 * - Auth only
 * - Validation only
 * - NO business logic
 * - NO database calls
 * - NO direct revalidateTag - use cacheHelpers
 */

export async function createStaffAction(input: unknown) {
  // 1. Auth
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // 2. Validation
  const validated = StaffAuthSchema.parse(input);

  // 3. Delegate to service (pass userId, not full session)
  const staff = await adminService.createStaff(validated);

  // 4. Type-safe cache invalidation ✅
  cacheHelpers.staff.invalidateClinic(validated.clinicId);
  cacheHelpers.admin.invalidateDashboard(validated.clinicId);

  // 5. Optional: Revalidate UI paths
  revalidatePath('/dashboard/admin/staff');
  revalidatePath('/dashboard/admin');

  return { success: true, data: staff };
}

export async function createDoctorAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = CreateDoctorSchema.parse(input);

  if (!validated.clinicId) {
    throw new Error('clinicId is required');
  }

  // Ensure clinicId is present and of type string
  if (typeof validated.clinicId !== 'string') {
    throw new Error('clinicId must be a string');
  }

  const doctor = await adminService.createDoctor(
    {
      ...validated,
      appointmentPrice: toNumber(validated.appointmentPrice),
      clinicId: validated.clinicId
    },
    session.user.id
  );

  // ✅ Type-safe cache invalidation
  cacheHelpers.doctor.invalidateClinic(validated.clinicId);
  cacheHelpers.admin.invalidateDashboard(validated.clinicId);

  revalidatePath('/dashboard/admin/doctors');
  revalidatePath('/dashboard/admin');

  return { success: true, data: doctor };
}

export async function createServiceAction(input: unknown) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = ServicesSchema.parse(input);

  const service = await adminService.createService(validated);

  // ✅ Type-safe cache invalidation
  cacheHelpers.service.invalidateClinic(validated.clinicId);
  cacheHelpers.admin.invalidateDashboard(validated.clinicId);

  revalidatePath('/dashboard/admin/services');
  revalidatePath('/dashboard/admin');

  return { success: true, data: service };
}

export async function updateServiceAction({ input, clinicId }: { input: UpdateServiceInput; clinicId: string }) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validated = ServicesSchema.parse(input);

  // 1. Ensure ID exists and is a string
  const serviceId = validated.id as string; // Ensure it's a string
  if (!serviceId) {
    throw new Error('Service ID required for update');
  }

  // 2. Call the service (ensure arguments match: id, clinicId, data)
  const service = await adminService.updateService(serviceId, clinicId, validated);

  // ✅ Type-safe cache invalidation
  // Use serviceId instead of validated.id to ensure string type
  cacheHelpers.service.invalidate(serviceId as string, clinicId);
  cacheHelpers.admin.invalidateDashboard(clinicId);

  revalidatePath('/dashboard/admin/services');
  revalidatePath(`/dashboard/admin/services/${serviceId}`);

  return { success: true, data: service };
}
export async function deleteServiceAction(id: string, clinicId: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Assuming the signature changed to accept a single options object to resolve the argument count error.
  await adminService.deleteService({ id, clinicId, deleteType: 'service' });

  // ✅ Type-safe cache invalidation
  cacheHelpers.service.invalidate(id, clinicId);
  cacheHelpers.admin.invalidateDashboard(clinicId);

  revalidatePath('/dashboard/admin/services');
  revalidatePath('/dashboard/admin');

  return { success: true };
}
