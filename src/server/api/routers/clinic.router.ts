import { TRPCError } from '@trpc/server';

import {
  clinicCreateSchema,
  clinicGetByIdSchema,
  clinicGetOneSchema,
  DashboardStatsInputSchema,
  MedicalRecordsSummaryInputSchema,
  reviewSchema
} from '../../../zodSchemas';
import { appointmentService, clinicService, dashboardService, vaccinationService } from '../../db/services';
import { createTRPCRouter, protectedProcedure } from '..';

export const clinicRouter = createTRPCRouter({
  // ==================== QUERIES ====================

  getOne: protectedProcedure.input(clinicGetOneSchema).query(async ({ input, ctx }) => {
    return clinicService.getClinicWithUserAccess(input.id, ctx.user.id ?? '');
  }),

  getById: protectedProcedure.input(clinicGetByIdSchema).query(async ({ input }) => {
    return clinicService.getClinicById(input.id);
  }),

  // ==================== MUTATIONS ====================

  createClinic: protectedProcedure.input(clinicCreateSchema).mutation(async ({ input, ctx }) => {
    return clinicService.createClinic(input, ctx.user.id ?? '');
  }),

  createReview: protectedProcedure.input(reviewSchema).mutation(async ({ input }) => {
    if (!input.clinicId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Clinic ID is required'
      });
    }

    return clinicService.createReview({
      ...input,
      rating: input.rating,
      comment: input.comment
    });
  }),
  getDashboard: protectedProcedure.input(DashboardStatsInputSchema).query(async ({ input, ctx }) => {
    const clinicId = ctx.session?.user.clinic?.id;
    if (!clinicId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be associated with a clinic.'
      });
    }

    return dashboardService.getDashboardStats(clinicId, {
      clinicId,
      from: input.from,
      to: input.to
    });
  }),

  getStats: protectedProcedure.query(async () => {
    return dashboardService.getGeneralStats();
  }),

  getMedicalRecordsSummary: protectedProcedure.input(MedicalRecordsSummaryInputSchema).query(async ({ input, ctx }) => {
    await clinicService.getClinicWithUserAccess(input.clinicId, ctx.user.id ?? '');

    return dashboardService.getMedicalRecordsSummary(input.clinicId);
  }),

  getRecentAppointments: protectedProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user.clinic?.id;
    if (!clinicId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be associated with a clinic.'
      });
    }

    return dashboardService.getRecentAppointments(clinicId);
  }),

  getTodaySchedule: protectedProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user.clinic?.id;
    if (!clinicId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be associated with a clinic.'
      });
    }

    return appointmentService.getTodayAppointments(clinicId);
  }),

  getUpcomingImmunizations: protectedProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user.clinic?.id;
    if (!clinicId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be associated with a clinic.'
      });
    }

    return vaccinationService.getUpcomingImmunizations(clinicId);
  })
});
