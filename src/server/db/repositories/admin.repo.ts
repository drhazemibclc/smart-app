// modules/admin/admin.query.ts
import { dedupeQuery } from '@/lib/cache/utils/dedupe';
import { db } from '@/server/db';

export const adminQueries = {
  // Get dashboard stats
  getDashboardStats: dedupeQuery(async (clinicId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [patients, doctors, appointments] = await db.$transaction([
      db.patient.count({
        where: { clinicId, isDeleted: false }
      }),
      db.doctor.count({
        where: { clinicId, isDeleted: false }
      }),
      db.appointment.findMany({
        where: {
          clinicId,
          isDeleted: false,
          appointmentDate: { gte: today }
        },
        orderBy: { appointmentDate: 'desc' },
        take: 5,
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              image: true
            }
          },
          doctor: {
            select: {
              name: true,
              img: true
            }
          }
        }
      })
    ]);

    // Get appointments grouped by status for the current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const appointmentsByStatus = await db.appointment.groupBy({
      by: ['status'],
      where: {
        clinicId,
        isDeleted: false,
        appointmentDate: { gte: startOfMonth }
      },
      _count: true
    });

    // Get monthly appointment data for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAppointments = await db.appointment.findMany({
      where: {
        clinicId,
        isDeleted: false,
        appointmentDate: { gte: sixMonthsAgo }
      },
      select: {
        appointmentDate: true,
        status: true
      }
    });

    return {
      totalPatients: patients,
      totalDoctors: doctors,
      recentAppointments: appointments,
      appointmentsByStatus,
      monthlyAppointments
    };
  }),

  // Get available doctors
  getAvailableDoctors: dedupeQuery(async (clinicId: string, day: string) => {
    const today = new Date().toISOString().split('T')[0];

    return db.doctor.findMany({
      where: {
        clinicId,
        isDeleted: false,
        isActive: true,
        workingDays: {
          some: {
            day: day.toUpperCase()
          }
        }
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        img: true,
        colorCode: true,
        workingDays: {
          where: { day: day.toUpperCase() },
          select: {
            day: true,
            startTime: true,
            endTime: true
          }
        },
        appointments: {
          where: {
            appointmentDate: {
              gte: new Date(today),
              lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1))
            }
          },
          select: { id: true }
        }
      },
      take: 4
    });
  })
};
