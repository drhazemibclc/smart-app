import { TRPCError } from '@trpc/server';
import z from 'zod';

import {
  bulkSettingsSchema,
  clinicCreateSchema,
  clinicGetByIdSchema,
  clinicGetOneSchema,
  DashboardStatsInputSchema,
  MedicalRecordsSummaryInputSchema,
  reviewSchema,
  settingFiltersSchema,
  settingSchema,
  updateSettingSchema
} from '../../../zodSchemas';
import { appointmentService, clinicService, dashboardService, vaccinationService } from '../../db/services';
import type { Settings } from '../../db/types';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '..';

export const clinicRouter = createTRPCRouter({
  createSetting: protectedProcedure.input(settingSchema).mutation(async ({ input, ctx }): Promise<Settings> => {
    const { user } = ctx;

    // Check if user has admin privileges
    if (user.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only administrators can create settings'
      });
    }

    try {
      // Check if setting with this key already exists
      const existingSetting = await ctx.db.settings.findUnique({
        where: { key: input.key }
      });

      if (existingSetting) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Setting with key '${input.key}' already exists`
        });
      }

      // Create the setting
      const setting = await ctx.db.settings.create({
        data: {
          key: input.key,
          value: input.value
        }
      });

      // Log the action for audit trail
      await ctx.db.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_SETTING',
          resource: 'Settings',
          level: 'info',
          resourceId: setting.id,
          details: `Created setting: ${input.key}`,
          model: 'Settings'
        }
      });

      return setting;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create setting',
        cause: error
      });
    }
  }),

  /**
   * Get all settings with optional filtering
   */
  getAllSettings: protectedProcedure.input(settingFiltersSchema).query(async ({ input, ctx }) => {
    const { search, limit, cursor } = input;

    const settings = await ctx.db.settings.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { key: { contains: search, mode: 'insensitive' } },
                { value: { contains: search, mode: 'insensitive' } }
              ]
            }
          : {})
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    });

    let nextCursor: typeof cursor | undefined;
    if (settings.length > limit) {
      const nextItem = settings.pop();
      nextCursor = nextItem?.id;
    }

    return {
      items: settings,
      nextCursor
    };
  }),

  /**
   * Get a single setting by key
   * Public procedure - settings can be read by anyone
   */
  getSettingByKey: publicProcedure.input(z.object({ key: z.string() })).query(async ({ input, ctx }) => {
    const setting = await ctx.db.settings.findUnique({
      where: { key: input.key }
    });

    if (!setting) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Setting with key '${input.key}' not found`
      });
    }

    return setting;
  }),

  /**
   * Get multiple settings by keys
   */
  getManyByKeys: protectedProcedure.input(z.object({ keys: z.array(z.string()) })).query(async ({ input, ctx }) => {
    const settings = await ctx.db.settings.findMany({
      where: {
        key: {
          in: input.keys
        }
      }
    });

    // Return as a key-value map for easier consumption
    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>
    );
  }),

  /**
   * Update a setting
   */
  updateSetting: protectedProcedure.input(updateSettingSchema).mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { id, ...data } = input;

    // Check if user has admin privileges
    if (user.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only administrators can update settings'
      });
    }

    const setting = await ctx.db.settings.findUnique({
      where: { id }
    });

    if (!setting) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Setting not found'
      });
    }

    // If updating key, check for uniqueness
    if (data.key && data.key !== setting.key) {
      const existingSetting = await ctx.db.settings.findUnique({
        where: { key: data.key }
      });

      if (existingSetting) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Setting with key '${data.key}' already exists`
        });
      }
    }

    const updatedSetting = await ctx.db.settings.update({
      where: { id },
      data
    });

    // Log the update
    await ctx.db.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_SETTING',
        resource: 'Settings',
        level: 'info',
        resourceId: id,
        details: `Updated setting: ${setting.key}`,
        model: 'Settings'
      }
    });

    return updatedSetting;
  }),

  /**
   * Delete a setting
   */
  deleteSetting: protectedProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ input, ctx }) => {
    const { user } = ctx;

    // Check if user has admin privileges
    if (user.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only administrators can delete settings'
      });
    }

    const setting = await ctx.db.settings.findUnique({
      where: { id: input.id }
    });

    if (!setting) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Setting not found'
      });
    }

    // Don't allow deletion of critical system settings
    const protectedKeys = ['system.theme', 'system.maintenance', 'system.version'];
    if (protectedKeys.includes(setting.key)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete protected system settings'
      });
    }

    await ctx.db.settings.delete({
      where: { id: input.id }
    });

    // Log the deletion
    await ctx.db.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_SETTING',
        resource: 'Settings',
        level: 'info',
        resourceId: input.id,
        details: `Deleted setting: ${setting.key}`,
        model: 'Settings'
      }
    });

    return { success: true, message: 'Setting deleted successfully' };
  }),

  /**
   * Bulk create/update settings
   */
  bulkUpsertSetting: protectedProcedure.input(bulkSettingsSchema).mutation(async ({ input, ctx }) => {
    const { user } = ctx;

    // Check if user has admin privileges
    if (user.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only administrators can modify settings'
      });
    }

    const results = await ctx.db.$transaction(async tx => {
      const created: Settings[] = [];
      const updated: Settings[] = [];

      for (const setting of input.settings) {
        const existing = await tx.settings.findUnique({
          where: { key: setting.key }
        });

        if (existing) {
          const updatedSetting = await tx.settings.update({
            where: { id: existing.id },
            data: { value: setting.value }
          });
          updated.push(updatedSetting);
        } else {
          const createdSetting = await tx.settings.create({
            data: setting
          });
          created.push(createdSetting);
        }
      }

      return { created, updated };
    });

    // Log the bulk operation
    await ctx.db.auditLog.create({
      data: {
        userId: user.id,
        action: 'BULK_UPSERT_SETTINGS',
        resource: 'Settings',
        level: 'info',
        details: `Bulk upsert: ${results.created.length} created, ${results.updated.length} updated`,
        model: 'Settings'
      }
    });

    return results;
  }),

  getSettingOne: protectedProcedure.input(clinicGetOneSchema).query(async ({ input, ctx }) => {
    return clinicService.getClinicWithUserAccess(input.id, ctx.user.id ?? '');
  }),

  getSettingById: protectedProcedure.input(clinicGetByIdSchema).query(async ({ input }) => {
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
    const clinicId = ctx.session?.user?.clinic?.id;
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
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be associated with a clinic.'
      });
    }

    return dashboardService.getRecentAppointments(clinicId);
  }),

  getTodaySchedule: protectedProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be associated with a clinic.'
      });
    }

    return appointmentService.getTodayAppointments(clinicId);
  }),

  getUpcomingImmunizations: protectedProcedure.query(async ({ ctx }) => {
    const clinicId = ctx.session?.user?.clinic?.id;
    if (!clinicId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be associated with a clinic.'
      });
    }

    return vaccinationService.getUpcomingImmunizations(clinicId);
  })
});
