import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import type { Prisma } from '@/prisma/types';

import { createTRPCRouter, publicProcedure } from '..';

export const medicalRouter = createTRPCRouter({
  // List medical records with pagination
  listRecords: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        page: z.number().min(1).default(1),
        patientId: z.string().optional(),
        doctorId: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        search: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, patientId, doctorId, fromDate, toDate, search } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.MedicalRecordsWhereInput = {};

      if (patientId) where.patientId = patientId;
      if (doctorId) where.doctorId = doctorId;

      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = fromDate;
        if (toDate) where.createdAt.lte = toDate;
      }

      if (search) {
        where.OR = [
          { diagnosis: { contains: search, mode: 'insensitive' } },
          { symptoms: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          {
            patient: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } }
              ]
            }
          },
          {
            doctor: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        ];
      }

      const [records, totalCount] = await Promise.all([
        ctx.db.medicalRecords.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true
              }
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialty: true
              }
            },
            vitalSigns: true,
            prescriptions: true
          }
        }),
        ctx.db.medicalRecords.count({ where })
      ]);

      return {
        records,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page
      };
    }),

  // Get single medical record by ID
  getRecordById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const record = await ctx.db.medicalRecords.findUnique({
      where: { id: input.id },
      include: {
        patient: true,
        doctor: true,
        vitalSigns: true,
        prescriptions: {
          include: {
            prescribedItems: true
          }
        },
        clinic: true,
        encounter: true
      }
    });

    if (!record) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Medical record not found'
      });
    }

    return record;
  }),

  // Create new medical record
  createRecord: publicProcedure
    .input(
      z.object({
        patientId: z.string(),
        doctorId: z.string(),
        appointmentId: z.string(),
        diagnosis: z.string().optional(),
        symptoms: z.array(z.string()).optional(),
        treatment: z.string().optional(),
        notes: z.string().optional(),
        vitalSigns: z
          .object({
            temperature: z.number().optional(),
            heartRate: z.number().optional(),
            respiratoryRate: z.number().optional(),
            bloodPressureSystolic: z.number().optional(),
            bloodPressureDiastolic: z.number().optional(),
            oxygenSaturation: z.number().optional(),
            weight: z.number().optional(),
            height: z.number().optional()
          })
          .optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { vitalSigns, appointmentId, ...recordData } = input;
      const { patientId, doctorId, ...restData } = recordData;

      // Create medical record with relations
      const createData: Prisma.MedicalRecordsCreateInput = {
        ...restData,
        symptoms: Array.isArray(input.symptoms) ? input.symptoms.join(', ') : (input.symptoms ?? ''),
        diagnosis: input.diagnosis ?? '',
        patient: { connect: { id: patientId } },
        doctor: { connect: { id: doctorId } },
        appointment: { connect: { id: appointmentId } },
        clinic: {
          connect: { id: ctx.session?.user?.clinic?.id ?? '' }
        },
        // Create vital signs if provided
        ...(vitalSigns && {
          vitalSigns: {
            create: {
              ...vitalSigns,
              patient: { connect: { id: patientId } }
            }
          }
        })
      };

      return ctx.db.medicalRecords.create({
        data: createData,
        include: {
          patient: true,
          doctor: true,
          vitalSigns: true,
          prescriptions: true
        }
      });
    }),

  // Update medical record
  updateRecord: publicProcedure
    .input(
      z.object({
        id: z.string(),
        diagnosis: z.string().optional(),
        symptoms: z.string().optional(),
        treatment: z.string().optional(),
        notes: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.db.medicalRecords.update({
        where: { id },
        data,
        include: {
          patient: true,
          doctor: true
        }
      });
    }),

  // Add vital signs to existing record
  addVitalSigns: publicProcedure
    .input(
      z.object({
        patientId: z.uuid(),
        recordId: z.string(),
        vitalSigns: z.object({
          temperature: z.number().optional(),
          heartRate: z.number().optional(),
          respiratoryRate: z.number().optional(),
          bloodPressureSystolic: z.number().optional(),
          bloodPressureDiastolic: z.number().optional(),
          oxygenSaturation: z.number().optional(),
          weight: z.number().optional(),
          height: z.number().optional()
        })
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.vitalSigns.create({
        data: {
          ...input.vitalSigns,
          patientId: input.patientId,
          medicalId: input.recordId
        }
      });
    }),

  // Delete medical record (soft delete or archive)
  deleteRecord: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    // Soft delete by setting isDeleted and deletedAt
    return ctx.db.medicalRecords.update({
      where: { id: input.id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  })
});
