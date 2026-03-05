import { TRPCError } from '@trpc/server';
import z from 'zod';

import {
  VisitByIdSchema,
  VisitByPatientSchema,
  VisitCountMonthSchema,
  VisitCountTodaySchema,
  VisitCreateSchema,
  VisitRecentSchema,
  VisitTodaySchema,
  VisitUpdateSchema
} from '../../../zodSchemas';
import { appointmentService } from '../../db/services';
import { AppointmentStatus } from '../../db/types';
import { createTRPCRouter, protectedProcedure } from '..';

export const visitRouter = createTRPCRouter({
  // ==================== QUERY PROCEDURES ====================

  /**
   * Get visit by ID
   */
  getById: protectedProcedure.input(VisitByIdSchema).query(async ({ ctx, input }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    return appointmentService.getAppointmentById(input.id, clinicId);
  }),

  /**
   * List visits with filters
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        patientId: z.uuid().optional(),
        doctorId: z.uuid().optional(),
        status: z.array(z.enum(['PENDING', 'SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const clinicId = ctx.session.user?.clinic?.id ?? '';

      const appointments = await appointmentService.getAppointments(clinicId, {
        ...input,
        page: Math.floor(input.offset / input.limit) + 1,
        limit: input.limit,
        clinic: '',
        updatedAt: new Date()
      });

      return appointments;
    }),

  /**
   * Get visits by patient
   */
  getByPatient: protectedProcedure.input(VisitByPatientSchema).query(async ({ ctx, input }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    // Verify patient belongs to clinic (handled in service)
    return appointmentService.getPatientAppointments(input.patientId, clinicId, {
      limit: input.limit,
      includePast: input.includePast
    });
  }),

  /**
   * Get recent visits
   */
  getRecent: protectedProcedure.input(VisitRecentSchema).query(async ({ ctx, input }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    return appointmentService.getAppointments(clinicId, {
      limit: input.limit || 10,
      page: 1,
      clinic: '',
      updatedAt: new Date()
    });
  }),

  /**
   * Get today's visits
   */
  getToday: protectedProcedure.input(VisitTodaySchema.optional()).query(async ({ ctx }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    return appointmentService.getTodayAppointments(clinicId);
  }),

  /**
   * Get upcoming visits
   */
  getUpcoming: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        doctorId: z.uuid().optional(),
        days: z.number().min(1).max(30).default(7)
      })
    )
    .query(async ({ ctx, input }) => {
      const clinicId = ctx.session.user?.clinic?.id ?? '';

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + input.days);

      return appointmentService.getAppointments(clinicId, {
        limit: input.limit,
        doctorId: input.doctorId,
        startDate,
        endDate,
        page: 1,
        clinic: '',
        updatedAt: new Date()
      });
    }),

  // ==================== COUNT PROCEDURES ====================

  /**
   * Get today's visit count
   */
  getTodayCount: protectedProcedure.input(VisitCountTodaySchema.optional()).query(async ({ ctx }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    const fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date();
    toDate.setHours(23, 59, 59, 999);
    const stats = await appointmentService.getAppointmentStats(clinicId, fromDate, toDate);

    return stats.totalAppointments;
  }),

  /**
   * Get month's visit count
   */
  getMonthCount: protectedProcedure.input(VisitCountMonthSchema.optional()).query(async ({ ctx }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const stats = await appointmentService.getAppointmentStats(clinicId, fromDate, toDate);

    return stats.totalAppointments;
  }),

  /**
   * Get visit count by status
   */
  getCountByStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(['PENDING', 'SCHEDULED', 'CANCELLED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'])
      })
    )
    .query(async ({ ctx, input }) => {
      const clinicId = ctx.session.user?.clinic?.id ?? '';

      const stats = await appointmentService.getAppointmentStats(clinicId);

      return stats.byStatus[input.status] || 0;
    }),

  /**
   * Get visit statistics
   */
  getStats: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month', 'year']).default('month')
      })
    )
    .query(async ({ ctx, input }) => {
      const clinicId = ctx.session.user?.clinic?.id ?? '';

      let fromDate: Date | undefined;
      let toDate: Date | undefined;
      const today = new Date();

      switch (input.period) {
        case 'day':
          fromDate = new Date(today);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(today);
          toDate.setHours(23, 59, 59, 999);
          break;
        case 'week': {
          const firstDay = new Date(today);
          firstDay.setDate(today.getDate() - today.getDay());
          firstDay.setHours(0, 0, 0, 0);
          const lastDay = new Date(firstDay);
          lastDay.setDate(firstDay.getDate() + 6);
          lastDay.setHours(23, 59, 59, 999);
          fromDate = firstDay;
          toDate = lastDay;
          break;
        }
        case 'month':
          fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
          toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        case 'year':
          fromDate = new Date(today.getFullYear(), 0, 1);
          toDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        default:
      }
      return appointmentService.getAppointmentStats(clinicId, fromDate, toDate);
    }),

  // ==================== SCHEDULE PROCEDURES ====================

  /**
   * Get doctor's schedule for a date
   */
  getDoctorSchedule: protectedProcedure
    .input(
      z.object({
        doctorId: z.uuid(),
        date: z.date().default(() => new Date())
      })
    )
    .query(async ({ input }) => {
      return appointmentService.getAvailableTimes(input.doctorId, input.date);
    }),

  // ==================== MUTATION PROCEDURES ====================

  /**
   * Create visit
   */
  create: protectedProcedure.input(VisitCreateSchema).mutation(async ({ ctx, input }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    return appointmentService.createAppointment(
      {
        ...input,
        clinicId
      },
      clinicId
    );
  }),

  /**
   * Update visit
   */
  update: protectedProcedure.input(VisitUpdateSchema).mutation(async ({ ctx, input }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    // Get existing appointment to fill in required fields
    const existing = await appointmentService.getAppointmentById(input.id, clinicId);

    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Appointment not found'
      });
    }

    // Transform serviceId from nested object to string if needed
    const serviceId =
      typeof input.serviceId === 'object' && input.serviceId !== null && 'id' in input.serviceId
        ? input.serviceId.id
        : input.serviceId;

    // Ensure type is present (required by AppointmentUpdateSchema)
    const updateData = {
      ...input,
      serviceId,
      type: input.type ?? ('CONSULTATION' as const)
    };

    return appointmentService.updateAppointment(updateData, clinicId);
  }),

  /**
   * Update visit status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        status: AppointmentStatus,
        reason: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clinicId = ctx.session.user?.clinic?.id ?? '';

      // Get the appointment first to verify clinic access
      const appointment = await appointmentService.getAppointmentById(input.id, clinicId);

      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        });
      }

      if (input.status === 'PENDING') {
        return appointmentService.cancelAppointment(input.id, ctx.session.user.id, clinicId, input.reason);
      }

      if (input.status === 'COMPLETED') {
        return appointmentService.completeAppointment(input.id, ctx.session.user.id, clinicId, input.reason);
      }

      if (input.status === 'CHECKED_IN') {
        return appointmentService.checkInPatient(input.id, ctx.session.user.id, clinicId);
      }

      // For other status updates, use the update method
      return appointmentService.updateAppointment(
        {
          id: input.id,
          status: input.status as AppointmentStatus,
          type: 'CONSULTATION' as const
        },
        clinicId
      );
    }),

  /**
   * Cancel visit
   */
  cancel: protectedProcedure
    .input(z.object({ id: z.uuid(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const clinicId = ctx.session.user?.clinic?.id ?? '';

      return appointmentService.cancelAppointment(input.id, ctx.session.user.id, clinicId, input.reason);
    }),

  /**
   * Complete visit
   */
  complete: protectedProcedure
    .input(z.object({ id: z.uuid(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const clinicId = ctx.session.user?.clinic?.id ?? '';

      return appointmentService.completeAppointment(input.id, ctx.session.user.id, clinicId, input.notes);
    }),

  /**
   * Check in patient
   */
  checkIn: protectedProcedure.input(z.object({ id: z.uuid() })).mutation(async ({ ctx, input }) => {
    const clinicId = ctx.session.user?.clinic?.id ?? '';

    return appointmentService.checkInPatient(input.id, ctx.session.user.id, clinicId);
  }),

  /**
   * Reschedule visit
   */
  reschedule: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        appointmentDate: z.date(),
        time: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .optional(),
        doctorId: z.uuid().optional(),
        reason: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clinicId = ctx.session.user?.clinic?.id ?? '';

      return appointmentService.updateAppointment(
        {
          id: input.id,
          appointmentDate: input.appointmentDate,
          time: input.time,
          doctorId: input.doctorId,
          status: 'SCHEDULED' as const,
          type: 'CHECKUP' as const,
          note: input.reason
        },
        clinicId
      );
    })
});
