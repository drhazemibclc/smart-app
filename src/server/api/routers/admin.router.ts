import { TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { z } from 'zod';

import { invalidateFinancialCascade } from '../../../actions/auth/clinic-action';
import { invalidateDoctorCascade } from '../../../actions/doctor.action';
import {
  invalidateDoctorSearchCascade,
  invalidatePatientSearchCascade,
  onPatientStatusChanged
} from '../../../actions/patient.action';
import { invalidateClinicCache } from '../../../lib/cache/clinic.cache';
import { CreateNewDoctorInputSchema, DeleteInputSchema, StaffAuthSchema } from '../../../zodSchemas';
import { auth } from '../../auth';
import { adminService, clinicService, doctorService } from '../../db/services';
import { adminProcedure, createTRPCRouter } from '..';

// ✅ Import the service directly, remove web cache imports

// Input Schemas
const deleteInputSchema = z.object({
  id: z.string(),
  deleteType: z.enum(['doctor', 'patient', 'staff', 'service', 'appointment', 'payment', 'bill']),
  clinicId: z.string().optional()
});

export const adminRouter = createTRPCRouter({
  // ==================== QUERIES (READ) ====================

  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Clinic ID not found' });

    try {
      // ✅ Call service directly. Redis caching should happen inside this method.
      return await adminService.getAdminDashboardStats(clinicId);
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch stats' });
    }
  }),

  getClinicCounts: adminProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return await clinicService.countUserClinics(clinicId);
  }),

  getServices: adminProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return await adminService.getServices(clinicId);
  }),

  getServiceById: adminProcedure.input(z.object({ id: z.string(), clinicId: z.string() })).query(async ({ input }) => {
    return await adminService.getServiceById(input.id, input.clinicId);
  }),

  getStaffList: adminProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return await adminService.getStaffList(clinicId);
  }),

  getDoctorList: adminProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return await adminService.getDoctorList(clinicId);
  }),

  getTodaySchedule: adminProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return await doctorService.getTodaySchedule(clinicId);
  }),

  getRecentActivity: adminProcedure
    .input(
      z.object({
        clinicId: z.uuid(),
        limit: z.number().min(1).max(50).default(10)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (ctx.session?.user.clinic?.id !== input.clinicId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this clinic'
          });
        }

        // Pass userId from session context
        return await adminService.getRecentActivity(ctx.user.id, input.clinicId, input.limit);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recent activity'
        });
      }
    }),

  // ==================== MUTATIONS (WRITE) ====================
  // (Mutations remain largely the same as they already called adminService)

  createNewStaff: adminProcedure.input(StaffAuthSchema).mutation(async ({ ctx, input }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const result = await adminService.createStaff({ ...input, clinicId });
    return { success: true, staff: result };
  }),

  /**
   * 🟣 Create New Doctor
   */
  createNewDoctor: adminProcedure.input(CreateNewDoctorInputSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.user.id;

      // ✅ Pass the raw input directly - the service handles the mapping and validation
      const doctor = await adminService.createDoctor(input, userId);

      return {
        success: true,
        message: 'Doctor added successfully',
        doctor
      };
    } catch (error) {
      console.error('Error in createNewDoctor:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create doctor'
      });
    }
  }),
  getAvailableDoctors: adminProcedure
    .input(
      z.object({
        clinicId: z.uuid(),
        day: z.string() // 'monday', 'tuesday', etc.
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (ctx.session?.user.clinic?.id !== input.clinicId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this clinic'
          });
        }

        return await adminService.getAvailableDoctors(input.clinicId, input.day);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch available doctors'
        });
      }
    }),

  deleteService: adminProcedure.input(DeleteInputSchema).mutation(async ({ input }) => {
    await adminService.deleteService(input);
    return { success: true };
  }),
  getAppointmentStatus: adminProcedure
    .input(
      z.object({
        clinicId: z.uuid(),
        days: z.number().min(1).max(90).default(30)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (ctx.session?.user.clinic?.id !== input.clinicId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this clinic'
          });
        }

        return await adminService.getAppointmentStatus(input.clinicId, input.days);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch appointment status'
        });
      }
    }),
  // =========== DELETE OPERATIONS ===========
  deleteDataById: adminProcedure.input(deleteInputSchema).mutation(async ({ input, ctx }) => {
    const { id, deleteType, clinicId } = input;

    try {
      await ctx.db.$transaction(async tx => {
        // Soft delete / deactivate for users
        if (deleteType === 'patient') {
          await tx.patient.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false }
          });
        } else if (deleteType === 'staff') {
          await tx.staff.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false }
          });
        } else if (deleteType === 'doctor') {
          await tx.doctor.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false }
          });
        }
        // Hard delete for other tables
        else if (deleteType === 'service') {
          await tx.service.delete({ where: { id } });
        } else if (deleteType === 'appointment') {
          await tx.appointment.delete({ where: { id } });
        } else if (deleteType === 'payment') {
          await tx.payment.delete({ where: { id } });
        } else if (deleteType === 'bill') {
          await tx.patientBill.delete({ where: { id } });
        } else {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid delete type'
          });
        }

        // Remove auth user for doctor, staff, patient
        if (['doctor', 'staff', 'patient'].includes(deleteType) && clinicId) {
          await auth.api.removeUser({
            body: { userId: id },
            headers: await headers()
          });
        }
      });

      // Cache invalidation & post-delete hooks
      if (clinicId) {
        switch (deleteType) {
          case 'doctor':
            await invalidateDoctorCascade(id, clinicId, {
              includeSchedule: true,
              includeAppointments: true,
              includePatients: false
            });
            await invalidateDoctorSearchCascade(clinicId, id);
            break;

          case 'patient':
            await onPatientStatusChanged(id, clinicId, 'INACTIVE');
            await invalidatePatientSearchCascade(clinicId, id);
            break;

          case 'staff':
          case 'service':
          case 'appointment':
            await invalidateClinicCache(clinicId);
            break;

          case 'payment':
          case 'bill':
            await invalidateFinancialCascade(clinicId);
            break;

          default:
            await invalidateClinicCache(clinicId);
        }
      }

      return { message: `${deleteType} deleted successfully` };
    } catch (error) {
      console.error(`Failed to delete ${deleteType}:`, error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to delete ${deleteType}`,
        cause: error
      });
    }
  })
});
