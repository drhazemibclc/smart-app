// src/lib/validations/admin.ts

import { z } from 'zod';

import { UserRole } from '@/prisma/types';

export const UpdateUserRoleSchema = z.object({
  userId: z.cuid(),
  role: z.enum([UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF, UserRole.PATIENT]),
  reason: z.string().min(1).optional()
});

export const CreateClinicSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().default('UTC')
});

export const UpdateClinicSchema = CreateClinicSchema.partial();

export const SystemSettingsSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  defaultAppointmentDuration: z.number().min(15).max(120).default(30),
  allowPatientRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(false)
});

export const AuditLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  userId: z.cuid().optional(),
  action: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type CreateClinicInput = z.infer<typeof CreateClinicSchema>;
export type SystemSettingsInput = z.infer<typeof SystemSettingsSchema>;
