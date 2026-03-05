/**
 * 🟣 PRESCRIPTION MODULE - tRPC ROUTER
 *
 * RESPONSIBILITIES:
 * - tRPC procedure definitions
 * - Permission checks (via middleware)
 * - Input validation via schema
 * - Delegates to service layer (which uses cache internally)
 * - NO business logic
 * - NO database calls
 * - NO Next.js cache imports
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  CreatePrescriptionSchema,
  DeletePrescriptionSchema,
  GetActivePrescriptionsByPatientSchema,
  GetPrescriptionByIdSchema,
  GetPrescriptionsByMedicalRecordSchema,
  PrescriptionBaseSchema,
  type UpdatePrescriptionInput,
  UpdatePrescriptionSchema
} from '../../../zodSchemas';
import { prescriptionService } from '../../db/services';
import { createTRPCRouter, protectedProcedure } from '..';

export const prescriptionRouter = createTRPCRouter({
  // ==================== QUERIES ====================
  getPrescriptionStats: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        startDate: z.date().optional(),
        endDate: z.date().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify clinic access
        if (input.clinicId !== ctx.session?.user?.clinic?.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this clinic'
          });
        }

        // If date range provided, get stats for that period
        if (input.startDate && input.endDate) {
          return await prescriptionService.getPrescriptionStatsByDateRange(
            input.clinicId,
            input.startDate,
            input.endDate
          );
        }

        // Otherwise get current stats
        return await prescriptionService.getPrescriptionStats(input.clinicId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch prescription statistics'
        });
      }
    }),

  /**
   * Get monthly prescription trends
   */
  getPrescriptionMonthlyTrends: protectedProcedure
    .input(
      z.object({
        clinicId: z.string().uuid(),
        months: z.number().min(1).max(24).default(12)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (input.clinicId !== ctx.session?.user?.clinic?.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied'
          });
        }

        return await prescriptionService.getPrescriptionMonthlyTrends(input.clinicId, input.months);
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch monthly trends'
        });
      }
    }),

  /**
   * Get prescription by ID
   * Service/cache layer handles caching internally
   */
  getById: protectedProcedure.input(GetPrescriptionByIdSchema.shape.id).query(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user?.clinic?.id;
      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      const prescription = await prescriptionService.getPrescriptionById(input, clinicId);

      if (!prescription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prescription not found'
        });
      }

      return prescription;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch prescription'
      });
    }
  }),

  /**
   * Get prescriptions by medical record
   * Service/cache layer handles caching internally
   */
  getByMedicalRecord: protectedProcedure.input(GetPrescriptionsByMedicalRecordSchema).query(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user?.clinic?.id;
      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      const prescriptions = await prescriptionService.getPrescriptionsByMedicalRecord(input.medicalRecordId, clinicId, {
        limit: input.limit,
        offset: input.offset
      });

      return {
        items: prescriptions,
        total: prescriptions.length,
        limit: input.limit || 20,
        offset: input.offset || 0
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch prescriptions'
      });
    }
  }),

  /**
   * Get active prescriptions by patient
   * Service/cache layer handles caching internally
   */
  getActiveByPatient: protectedProcedure.input(GetActivePrescriptionsByPatientSchema).query(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user?.clinic?.id;
      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      // Verify patient belongs to clinic (security)
      const patient = await ctx.db.patient.findFirst({
        where: { id: input.patientId, clinicId }
      });

      if (!patient) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Patient not found or access denied'
        });
      }

      return await prescriptionService.getPatientActivePrescriptions(input.patientId, clinicId);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch active prescriptions'
      });
    }
  }),

  /**
   * Get patient prescription history (all prescriptions)
   * Service/cache layer handles caching internally
   */
  getPatientHistory: protectedProcedure
    .input(
      z.object({
        patientId: z.uuid(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
        includeInactive: z.boolean().optional().default(true)
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user?.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        // Verify patient belongs to clinic
        const patient = await ctx.db.patient.findFirst({
          where: { id: input.patientId, clinicId }
        });

        if (!patient) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Patient not found or access denied'
          });
        }

        const prescriptions = await prescriptionService.getPatientPrescriptionHistory(input.patientId, clinicId, {
          limit: input.limit,
          offset: input.offset,
          includeInactive: input.includeInactive
        });

        return {
          items: prescriptions,
          total: prescriptions.length,
          limit: input.limit || 50,
          offset: input.offset || 0
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch prescription history'
        });
      }
    }),

  /**
   * Get patient medical summary (includes prescriptions)
   * Service/cache layer handles caching internally
   */
  getPatientMedicalSummary: protectedProcedure
    .input(GetActivePrescriptionsByPatientSchema)
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user?.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        const summary = await prescriptionService.getPatientMedicalSummary(input.patientId, clinicId);

        if (!summary) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Patient not found'
          });
        }

        return summary;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch medical summary'
        });
      }
    }),

  /**
   * Get all prescriptions for clinic (admin view)
   * Service/cache layer handles caching internally
   */
  getClinicPrescriptions: protectedProcedure
    .input(
      z
        .object({
          clinicId: z.uuid(),
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
          status: z.enum(['active', 'completed', 'cancelled']).optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional()
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user?.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        // Only admin/doctor can view all prescriptions
        if (!['ADMIN', 'DOCTOR'].includes(ctx.session?.user?.role || '')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions'
          });
        }

        return await prescriptionService.getClinicPrescriptions(clinicId, {
          limit: input?.limit,
          offset: input?.offset,
          status: input?.status,
          startDate: input?.startDate,
          endDate: input?.endDate
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch clinic prescriptions'
        });
      }
    }),

  /**
   * Get prescriptions expiring soon (for notifications)
   * Service/cache layer handles caching internally
   */
  getExpiringSoon: protectedProcedure
    .input(
      z
        .object({
          clinicId: z.uuid(),
          daysThreshold: z.number().min(1).max(30).default(7)
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user?.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        // Only admin/doctor/nurse can view expiring prescriptions
        if (!['ADMIN', 'DOCTOR', 'NURSE'].includes(ctx.session?.user?.role || '')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions'
          });
        }

        return await prescriptionService.getPrescriptionsExpiringSoon(clinicId, input?.daysThreshold || 7);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch expiring prescriptions'
        });
      }
    }),

  /**
   * Get prescription count for dashboard
   * Service/cache layer handles caching internally
   */
  getPrescriptionCount: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(['active', 'completed', 'cancelled']).optional()
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user?.clinic?.id;
        if (!clinicId) {
          return 0;
        }

        return await prescriptionService.getPrescriptionCount(clinicId, input?.status);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch prescription count'
        });
      }
    }),

  // ==================== MUTATIONS ====================

  /**
   * Create new prescription
   * Service handles cache invalidation internally
   */
  create: protectedProcedure
    .input(CreatePrescriptionSchema) // Ensure this is imported correctly
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Validate Clinic Access
        const clinicId = ctx.session?.user?.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        // 2. Only doctors can create prescriptions
        if (ctx.session?.user?.role !== 'DOCTOR') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only doctors can create prescriptions'
          });
        }

        // 3. Resolve Doctor ID
        // Changed from ctx.session.user.doctorId to ctx.session.user.id to match your user type
        const doctorId = input.doctorId || ctx.session.user.id;

        if (!doctorId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Doctor ID is required'
          });
        }

        // 4. Handle Prisma Nested Creation
        // We pass the data to the service. Ensure your service handles the 'create' keyword
        // for the prescribedItems array to avoid the 'UncheckedCreateInput' error
        const result = await prescriptionService.createPrescription(
          {
            ...input,
            doctorId,
            clinicId,
            prescribedItems: {
              create: input.prescribedItems // Wrap the array in 'create'
            }
          },
          ctx.session.user.id
        );

        return {
          success: true,
          message: 'Prescription created successfully',
          data: result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('Prescription Creation Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create prescription'
        });
      }
    }),

  /**
   * Update prescription
   * Service handles cache invalidation internally
   */
  update: protectedProcedure.input(UpdatePrescriptionSchema).mutation(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user?.clinic?.id;
      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      // Only doctors can update prescriptions
      if (ctx.session?.user?.role !== 'DOCTOR') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only doctors can update prescriptions'
        });
      }

      const result = await prescriptionService.updatePrescription(
        input.id ?? '',
        clinicId,
        input as UpdatePrescriptionInput,
        ctx.user.id
      );

      return {
        success: true,
        message: 'Prescription updated successfully',
        data: result
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to update prescription'
      });
    }
  }),

  /**
   * Delete prescription (soft delete)
   * Service handles cache invalidation internally
   */
  delete: protectedProcedure.input(DeletePrescriptionSchema.shape.id).mutation(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user?.clinic?.id;
      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      // Only doctors can delete prescriptions
      if (ctx.session?.user?.role !== 'DOCTOR') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only doctors can delete prescriptions'
        });
      }

      const result = await prescriptionService.deletePrescription(input, clinicId, ctx.user.id);

      return {
        success: true,
        message: 'Prescription deleted successfully',
        data: result
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to delete prescription'
      });
    }
  }),

  /**
   * Complete prescription (change status to completed)
   * Service handles cache invalidation internally
   */
  complete: protectedProcedure
    .input(PrescriptionBaseSchema) // Use the object schema directly
    .mutation(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user?.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        // ✅ Removed '...' from input and changed ctx.user.id to ctx.session.user.id
        const result = await prescriptionService.completePrescription(
          input.id ?? '', // Or input.prescriptionId depending on your schema
          clinicId,
          ctx.session.user.id
        );

        return {
          success: true,
          message: 'Prescription completed successfully',
          data: result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to complete prescription'
        });
      }
    }),

  /**
   * Cancel prescription (change status to cancelled)
   * Service handles cache invalidation internally
   */
  cancel: protectedProcedure.input(DeletePrescriptionSchema.shape.id).mutation(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user?.clinic?.id;
      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      const result = await prescriptionService.cancelPrescription(input, clinicId, ctx.user.id);

      return {
        success: true,
        message: 'Prescription cancelled successfully',
        data: result
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to cancel prescription'
      });
    }
  })
});
