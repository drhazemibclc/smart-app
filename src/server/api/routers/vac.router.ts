/**
 * 🟣 VACCINATION MODULE - tRPC ROUTER
 *
 * RESPONSIBILITIES:
 * - tRPC procedure definitions
 * - Permission checks (via middleware)
 * - Input validation via schema
 * - Delegates to service layer
 * - NO business logic
 * - NO database calls
 * - NO Next.js cache imports
 * - NO direct action imports
 */

import type { AnyRouter } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  calculateDueVaccinesSchema,
  ImmunizationCreateSchema,
  ImmunizationUpdateSchema,
  ScheduleVaccinationSchema
} from '../../../zodSchemas';
import { vaccinationService } from '../../db/services';
import { createTRPCRouter, protectedProcedure } from '..';

export const vaccinationRouter: AnyRouter = createTRPCRouter({
  // ==================== QUERY PROCEDURES ====================

  /**
   * Get immunization by ID
   * Service handles caching internally
   */
  getImmunizationById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user.clinic?.id;
      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      return await vaccinationService.getImmunizationById(input.id, clinicId);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch immunization'
      });
    }
  }),

  /**
   * Get immunizations by patient
   * Service handles caching internally
   */
  getImmunizationsByPatient: protectedProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        includeCompleted: z.boolean().optional().default(true),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!(clinicId && input.patientId)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID or Patient ID not found'
          });
        }

        return await vaccinationService.getPatientImmunizations(input.patientId, clinicId, {
          includeCompleted: input.includeCompleted,
          limit: input.limit,
          offset: input.offset
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch patient immunizations'
        });
      }
    }),

  /**
   * Get immunizations by clinic
   * Service handles caching internally
   */
  getImmunizationsByClinic: protectedProcedure
    .input(
      z.object({
        status: z.enum(['SCHEDULED', 'COMPLETED', 'MISSED', 'DELAYED', 'EXEMPTED']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        return await vaccinationService.getClinicImmunizations(clinicId, {
          startDate: input.startDate,
          endDate: input.endDate,
          limit: input.limit,
          offset: input.offset
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch clinic immunizations'
        });
      }
    }),

  /**
   * Get upcoming vaccinations
   * Service handles caching internally
   */
  getUpcomingVaccinations: protectedProcedure
    .input(
      z.object({
        daysAhead: z.number().min(1).max(90).optional().default(30),
        limit: z.number().min(1).max(100).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        return await vaccinationService.getUpcomingImmunizations(clinicId, input.daysAhead, input.limit);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch upcoming vaccinations'
        });
      }
    }),

  /**
   * Get overdue vaccinations
   * Service handles caching internally
   */
  getOverdueVaccinations: protectedProcedure
    .input(
      z.object({
        daysOverdue: z.number().min(1).max(365).optional().default(30),
        limit: z.number().min(1).max(100).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        return await vaccinationService.getOverdueImmunizations(clinicId, input.daysOverdue, input.limit);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch overdue vaccinations'
        });
      }
    }),

  // ==================== COUNT PROCEDURES ====================

  /**
   * Get upcoming vaccination count
   * Service handles caching internally
   */
  getUpcomingVaccinationCount: protectedProcedure
    .input(z.object({ daysAhead: z.number().min(1).max(90).optional().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        return await vaccinationService.getUpcomingImmunizations(clinicId, input.daysAhead);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch upcoming count'
        });
      }
    }),

  /**
   * Get overdue vaccination count
   * Service handles caching internally
   */
  getOverdueVaccinationCount: protectedProcedure
    .input(z.object({ daysOverdue: z.number().min(1).max(365).optional().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        return await vaccinationService.getOverdueImmunizations(clinicId, input.daysOverdue);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch overdue count'
        });
      }
    }),

  /**
   * Get vaccination count by status
   * Service handles caching internally
   */
  getVaccinationCountByStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE', 'DELAYED', 'EXEMPTED'])
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        return await vaccinationService.getImmunizationsCountByStatus(input.status, clinicId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch count by status'
        });
      }
    }),

  // ==================== VACCINE SCHEDULE PROCEDURES ====================

  /**
   * Get vaccine schedule
   * Service handles caching internally
   */
  getVaccineSchedule: protectedProcedure.query(async () => {
    try {
      return await vaccinationService.getVaccineSchedule();
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch vaccine schedule'
      });
    }
  }),

  /**
   * Get vaccine schedule by age
   * Service handles caching internally
   */
  getVaccineScheduleByAge: protectedProcedure
    .input(z.object({ ageMonths: z.number().int().min(0).max(240) }))
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        return await vaccinationService.getVaccineScheduleByAge(input.ageMonths, clinicId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch schedule by age'
        });
      }
    }),

  // ==================== PATIENT SUMMARY PROCEDURES ====================

  /**
   * Get patient vaccination summary
   * Service handles caching internally
   */
  getPatientVaccinationSummary: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!(clinicId && input.patientId)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID or Patient ID not found'
          });
        }

        return await vaccinationService.getPatientVaccinationSummary(input.patientId, clinicId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch patient vaccination summary'
        });
      }
    }),

  /**
   * Get due vaccinations for a patient
   * Service handles caching internally
   */
  getDueVaccinations: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!(clinicId && input.patientId)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID or Patient ID not found'
          });
        }

        return await vaccinationService.getDueVaccinesForPatient(input.patientId, clinicId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch due vaccinations'
        });
      }
    }),

  /**
   * Calculate due vaccines for a patient
   * Service handles business logic internally
   */
  calculateDueVaccines: protectedProcedure
    .input(
      calculateDueVaccinesSchema.extend({
        patientId: z.string().uuid()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!(clinicId && input.patientId)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID or Patient ID not found'
          });
        }

        return await vaccinationService.calculateDueVaccinesForPatient(input.patientId, clinicId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to calculate due vaccines'
        });
      }
    }),

  /**
   * Get patient immunization record
   * Service handles caching internally
   */
  getPatientImmunizations: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        if (!(clinicId && input.patientId)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID or Patient ID not found'
          });
        }

        return await vaccinationService.getPatientImmunizations(input.patientId, clinicId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch immunization record'
        });
      }
    }),

  // ==================== MUTATION PROCEDURES ====================

  /**
   * Record immunization
   * Service handles cache invalidation internally
   */
  recordImmunization: protectedProcedure.input(ImmunizationCreateSchema).mutation(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user.clinic?.id;
      const userId = ctx.user.id;

      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      const result = await vaccinationService.recordImmunization(input, clinicId, userId);

      return {
        success: true,
        message: 'Immunization recorded successfully',
        data: result
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to record immunization'
      });
    }
  }),

  /**
   * Schedule vaccination
   * Service handles cache invalidation internally
   */
  scheduleVaccination: protectedProcedure.input(ScheduleVaccinationSchema).mutation(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user.clinic?.id;
      const userId = ctx.user.id;

      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      const result = await vaccinationService.scheduleVaccination(
        input.vaccineName,
        input.patientId,
        input.dueDate,
        userId
      );

      return {
        success: true,
        message: 'Vaccination scheduled successfully',
        data: result
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to schedule vaccination'
      });
    }
  }),

  /**
   * Update immunization
   * Service handles cache invalidation internally
   */
  updateImmunization: protectedProcedure.input(ImmunizationUpdateSchema).mutation(async ({ ctx, input }) => {
    try {
      const clinicId = ctx.session?.user.clinic?.id;
      const userId = ctx.user.id;

      if (!clinicId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Clinic ID not found'
        });
      }

      const result = await vaccinationService.updateImmunization(input.id, clinicId, {
        ...input,
        administeredById: userId
      });

      return {
        success: true,
        message: 'Immunization updated successfully',
        data: result
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to update immunization'
      });
    }
  }),

  /**
   * Update immunization status
   * Service handles cache invalidation internally
   */
  updateImmunizationStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['COMPLETED', 'OVERDUE', 'DELAYED', 'EXEMPTED']),
        notes: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        // const userId = ctx.user.id;

        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        const result = await vaccinationService.updateImmunizationStatus(input.id, clinicId, input.status, input.notes);

        return {
          success: true,
          message: 'Immunization status updated successfully',
          data: result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update immunization status'
        });
      }
    }),

  /**
   * Complete immunization
   * Service handles cache invalidation internally
   */
  completeImmunization: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        const userId = ctx.user.id;

        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        const result = await vaccinationService.completeImmunization(input.id, clinicId, userId);

        return {
          success: true,
          message: 'Immunization completed successfully',
          data: result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to complete immunization'
        });
      }
    }),

  /**
   * Delay immunization
   * Service handles cache invalidation internally
   */
  delayImmunization: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        notes: z.string().optional(),
        newDate: z.date().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        // const userId = ctx.user.id;

        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        const result = await vaccinationService.delayImmunization(input.id, clinicId, input.newDate ?? new Date());

        return {
          success: true,
          message: 'Immunization delayed successfully',
          data: result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delay immunization'
        });
      }
    }),

  /**
   * Schedule due vaccinations
   * Service handles cache invalidation internally
   */
  scheduleDueVaccinations: protectedProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        vaccineName: z.string().optional(),
        dueDate: z.date().optional(),
        clinicId: z.string().uuid().optional() // Optional override for clinic ID
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        // const userId = ctx.user.id;

        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        const result = await vaccinationService.scheduleVaccination(
          input.patientId,
          input.vaccineName ?? '',
          input.dueDate ?? new Date(),
          clinicId
        );

        return {
          success: true,
          message: 'Due vaccinations scheduled successfully',
          data: result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to schedule due vaccinations'
        });
      }
    }),

  /**
   * Delete immunization
   * Service handles cache invalidation internally
   */
  deleteImmunization: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        patientId: z.string().uuid()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const clinicId = ctx.session?.user.clinic?.id;
        // const userId = ctx.user.id;

        if (!clinicId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Clinic ID not found'
          });
        }

        const result = await vaccinationService.deleteImmunization(input.id, clinicId);

        return {
          success: true,
          message: 'Immunization deleted successfully',
          data: result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete immunization'
        });
      }
    })
});
