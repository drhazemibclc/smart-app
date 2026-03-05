// src/lib/repositories/prescription.repository.ts
import type { Prescription, Prisma, PrismaClient } from '@/prisma/client';

import type { PrescriptionStatistics } from '../../../types/prescription';

/**
 * 🔷 PRESCRIPTION REPOSITORY
 * - ONLY raw Prisma queries
 * - NO business logic
 * - NO date calculations
 * - NO error handling (throws to service layer)
 */

// ==================== TYPE DEFINITIONS ====================

export const prescriptionInclude = {
  patient: true,
  doctor: true,
  prescribedItems: true,
  encounter: true
} satisfies Prisma.PrescriptionInclude;

export type PrescriptionWithRelations = Prisma.PrescriptionGetPayload<{
  include: typeof prescriptionInclude;
}>;

export type PrescriptionFindManyInclude = Prisma.PrescriptionInclude & {
  doctor?: { select: { id: true; name: true } };
  prescribedItems?: {
    include: {
      drug?: { select: { id: true; name: true } } | boolean;
    };
  };
  encounter?: { select: { id: true; diagnosis: true } };
};

export type PrescriptionWithFullRelations = Prisma.PrescriptionGetPayload<{
  include: {
    patient: true;
    doctor: true;
    prescribedItems: true;
    encounter: true;
  };
}>;

export type PrescriptionWithMedicalRelations = Prisma.PrescriptionGetPayload<{
  include: {
    doctor: { select: { id: true; name: true } };
    prescribedItems: {
      include: {
        drug: { select: { id: true; name: true } };
      };
    };
    encounter: { select: { id: true; diagnosis: true } };
  };
}>;

export type PrescriptionWithDrugDetails = Prisma.PrescriptionGetPayload<{
  include: {
    doctor: { select: { id: true; name: true } };
    prescribedItems: {
      include: {
        drug: true;
      };
    };
  };
}>;

export interface FindPrescriptionsOptions {
  limit?: number;
  offset?: number;
  orderBy?: Prisma.PrescriptionOrderByWithRelationInput;
  includeInactive?: boolean;
}

export interface DateRangeOptions {
  startDate?: Date;
  endDate?: Date;
}

export interface PrescriptionStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface TopMedication {
  drug_name: string;
  prescription_count: bigint | number;
  unique_patients: bigint | number;
}

export interface DoctorPrescriptionStats {
  doctorId: string;
  status: string;
  _count: number;
}

// ==================== READ OPERATIONS ====================

/**
 * Find a single prescription by ID with full relations
 */
export async function findPrescriptionById(
  db: PrismaClient,
  id: string
): Promise<PrescriptionWithFullRelations | null> {
  // Basic validation - throw if ID is invalid (service layer will catch)
  if (!id) {
    throw new Error('Prescription ID is required');
  }

  return db.prescription.findUnique({
    where: {
      id
    },
    include: {
      patient: true,
      doctor: true,
      prescribedItems: {
        include: {
          drug: true
        }
      },
      encounter: true
    }
  });
}

/**
 * Find prescriptions by medical record ID
 * Returns prescriptions with doctor, prescribed items, and encounter info
 */
export async function findPrescriptionsByMedicalRecord(
  db: PrismaClient,
  medicalRecordId: string,
  options?: FindPrescriptionsOptions
): Promise<PrescriptionWithMedicalRelations[]> {
  // Basic validation
  if (!medicalRecordId) {
    throw new Error('Medical record ID is required');
  }

  const { limit = 20, offset = 0, orderBy = { issuedDate: 'desc' }, includeInactive = true } = options || {};

  return db.prescription.findMany({
    where: {
      medicalRecordId,

      // Optionally filter by status
      ...(includeInactive ? {} : { status: 'active' })
    },
    include: {
      doctor: {
        select: {
          id: true,
          name: true
        }
      },
      prescribedItems: {
        include: {
          drug: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      encounter: {
        select: {
          id: true,
          diagnosis: true
        }
      }
    },
    orderBy,
    take: limit,
    skip: offset
  });
}

/**
 * Find active prescriptions by patient ID
 * Filters by status='active' and endDate >= currentDate
 */
export async function findActivePrescriptionsByPatient(
  db: PrismaClient,
  patientId: string,
  currentDate: Date,
  options?: Omit<FindPrescriptionsOptions, 'includeInactive'>
): Promise<PrescriptionWithDrugDetails[]> {
  // Basic validation
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  if (!(currentDate instanceof Date) || Number.isNaN(currentDate.getTime())) {
    throw new Error('Valid current date is required');
  }

  const { limit = 50, offset = 0, orderBy = { issuedDate: 'desc' } } = options || {};

  return db.prescription.findMany({
    where: {
      patientId,

      status: 'active',
      endDate: {
        gte: currentDate
      }
    },
    include: {
      doctor: {
        select: {
          id: true,
          name: true
        }
      },
      prescribedItems: {
        include: {
          drug: true // Include full drug details for active prescriptions
        }
      }
    },
    orderBy,
    take: limit,
    skip: offset
  });
}

/**
 * Get prescription statistics for clinic
 */
export async function getPrescriptionStats(
  db: PrismaClient,
  clinicId: string,
  startDate?: Date,
  endDate?: Date
): Promise<PrescriptionStatistics> {
  // Basic validation
  if (!clinicId) {
    throw new Error('Clinic ID is required');
  }

  const where: Prisma.PrescriptionWhereInput = {
    clinicId,

    issuedDate: {
      gte: startDate,
      lte: endDate
    }
  };

  const [total, active, completed] = await Promise.all([
    db.prescription.count({ where }),
    db.prescription.count({
      where: {
        clinicId,
        status: 'active',
        endDate: { gte: new Date() }
      }
    }),
    db.prescription.count({
      where: {
        clinicId,
        status: 'completed'
      }
    })
  ]);

  return {
    total,
    active,
    completed,
    cancelled: total - active - completed
  };
}

/**
 * 🔥 NEW: Get comprehensive prescription statistics by clinic with status breakdown
 */
export async function getStatsByClinic(db: PrismaClient, clinicId: string): Promise<PrescriptionStats> {
  // Basic validation
  if (!clinicId) {
    throw new Error('Clinic ID is required');
  }

  // Use aggregation for better performance
  const [total, active, completed, cancelled] = await Promise.all([
    db.prescription.count({
      where: {
        clinicId
      }
    }),
    db.prescription.count({
      where: {
        clinicId,
        status: 'active'
      }
    }),
    db.prescription.count({
      where: {
        clinicId,
        status: 'completed'
      }
    }),
    db.prescription.count({
      where: {
        clinicId,
        status: 'cancelled'
      }
    })
  ]);

  return {
    total,
    active,
    completed,
    cancelled
  };
}

/**
 * 🔥 NEW: Get prescription statistics within a specific date range
 */
export async function getStatsByDateRange(
  db: PrismaClient,
  clinicId: string,
  startDate: Date,
  endDate: Date
): Promise<PrescriptionStats> {
  // Basic validation
  if (!clinicId) {
    throw new Error('Clinic ID is required');
  }

  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new Error('Valid start and end dates are required');
  }

  const where = {
    clinicId,

    issuedDate: {
      gte: startDate,
      lte: endDate
    }
  };

  const [total, active, completed, cancelled] = await Promise.all([
    db.prescription.count({ where }),
    db.prescription.count({
      where: { ...where, status: 'active' }
    }),
    db.prescription.count({
      where: { ...where, status: 'completed' }
    }),
    db.prescription.count({
      where: { ...where, status: 'cancelled' }
    })
  ]);

  return { total, active, completed, cancelled };
}

/**
 * 🔥 NEW: Get monthly prescription trends for analytics
 */
export async function getMonthlyTrends(
  db: PrismaClient,
  clinicId: string,
  months = 12
): Promise<Array<{ month: string; year: number; count: number; status: string }>> {
  // Basic validation
  if (!clinicId) {
    throw new Error('Clinic ID is required');
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Use raw query for better performance with date grouping
  const results = await db.$queryRaw<Array<{ month: number; year: number; count: bigint; status: string }>>`
    SELECT
      EXTRACT(MONTH FROM issued_date) as month,
      EXTRACT(YEAR FROM issued_date) as year,
      status,
      COUNT(*) as count
    FROM prescriptions
    WHERE clinic_id = ${clinicId}
      AND is_deleted = false
      AND issued_date >= ${startDate}
      AND issued_date <= ${endDate}
    GROUP BY
      EXTRACT(YEAR FROM issued_date),
      EXTRACT(MONTH FROM issued_date),
      status
    ORDER BY year ASC, month ASC
  `;

  return results.map(row => ({
    month: row.month.toString(),
    year: Number(row.year),
    count: Number(row.count),
    status: row.status
  }));
}

/**
 * 🔥 NEW: Get top prescribed medications with prescription counts
 */
export async function getTopMedications(db: PrismaClient, clinicId: string, limit = 10): Promise<TopMedication[]> {
  // Basic validation
  if (!clinicId) {
    throw new Error('Clinic ID is required');
  }

  const results = await db.$queryRaw<TopMedication[]>`
    SELECT
      d.name as drug_name,
      COUNT(*) as prescription_count,
      COUNT(DISTINCT p.patient_id) as unique_patients
    FROM prescribed_items pi
    JOIN drugs d ON pi.drug_id = d.id
    JOIN prescriptions p ON pi.prescription_id = p.id
    WHERE p.clinic_id = ${clinicId}
      AND p.is_deleted = false
    GROUP BY d.id, d.name
    ORDER BY prescription_count DESC
    LIMIT ${limit}
  `;

  // Convert BigInt values to numbers for JSON serialization
  return results.map(item => ({
    drug_name: item.drug_name,
    prescription_count: Number(item.prescription_count),
    unique_patients: Number(item.unique_patients)
  }));
}

/**
 * 🔥 NEW: Get prescription statistics grouped by doctor
 */
export async function getDoctorStats(
  db: PrismaClient,
  clinicId: string,
  doctorId?: string
): Promise<DoctorPrescriptionStats[]> {
  // Basic validation
  if (!clinicId) {
    throw new Error('Clinic ID is required');
  }

  const where: Prisma.PrescriptionWhereInput = {
    clinicId
  };

  if (doctorId) {
    where.doctorId = doctorId;
  }

  const stats = await db.prescription.groupBy({
    by: ['doctorId', 'status'],
    where,
    _count: true
  });

  return stats.map(stat => ({
    doctorId: stat.doctorId ?? '',
    status: stat.status,
    _count: stat._count
  }));
}

/**
 * Find prescriptions by patient ID (all statuses)
 * Useful for patient history
 */
export async function findPrescriptionsByPatient(
  db: PrismaClient,
  patientId: string,
  options?: FindPrescriptionsOptions
): Promise<PrescriptionWithMedicalRelations[]> {
  // Basic validation
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  const { limit = 50, offset = 0, orderBy = { issuedDate: 'desc' }, includeInactive = true } = options || {};

  return db.prescription.findMany({
    where: {
      patientId,
      ...(includeInactive ? {} : { status: 'active' })
    },
    include: {
      doctor: {
        select: {
          id: true,
          name: true
        }
      },
      prescribedItems: {
        include: {
          drug: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      encounter: {
        select: {
          id: true,
          diagnosis: true
        }
      }
    },
    orderBy,
    take: limit,
    skip: offset
  });
}

/**
 * Find prescriptions by clinic ID
 * For admin/clinic-wide views
 */
export async function findPrescriptionsByClinic(
  db: PrismaClient,
  clinicId: string,
  options?: FindPrescriptionsOptions & {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<PrescriptionWithMedicalRelations[]> {
  // Basic validation
  if (!clinicId) {
    throw new Error('Clinic ID is required');
  }

  const {
    limit = 100,
    offset = 0,
    orderBy = { issuedDate: 'desc' },
    status,
    startDate,
    endDate,
    includeInactive = true
  } = options || {};

  // Build date filter if provided
  const dateFilter: Prisma.DateTimeFilter | undefined =
    startDate || endDate
      ? {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate })
        }
      : undefined;

  return db.prescription.findMany({
    where: {
      clinicId,
      ...(status ? { status } : {}),
      ...(dateFilter ? { issuedDate: dateFilter } : {}),
      ...(includeInactive ? {} : { status: 'active' })
    },
    include: {
      doctor: {
        select: {
          id: true,
          name: true
        }
      },
      prescribedItems: {
        include: {
          drug: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      encounter: {
        select: {
          id: true,
          diagnosis: true
        }
      },
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy,
    take: limit,
    skip: offset
  });
}

/**
 * Count prescriptions by various criteria
 */
export async function countPrescriptions(db: PrismaClient, where: Prisma.PrescriptionWhereInput): Promise<number> {
  return db.prescription.count({
    where: {
      ...where
    }
  });
}

// ==================== WRITE OPERATIONS ====================

/**
 * Create a new prescription
 */
export async function createPrescription(
  db: PrismaClient,
  data: Prisma.PrescriptionUncheckedCreateInput
): Promise<Prescription> {
  return db.prescription.create({
    data: {
      ...data
    }
  });
}

/**
 * Update an existing prescription
 */
export async function updatePrescription(
  db: PrismaClient,
  id: string,
  data: Prisma.PrescriptionUncheckedUpdateInput
): Promise<Prescription> {
  if (!id) {
    throw new Error('Prescription ID is required for update');
  }

  return db.prescription.update({
    where: { id },
    data
  });
}

/**
 * Soft delete a prescription
 */
export async function softDeletePrescription(db: PrismaClient, id: string): Promise<Prescription> {
  if (!id) {
    throw new Error('Prescription ID is required for deletion');
  }

  return db.prescription.update({
    where: { id },
    data: {
      status: 'cancelled'
    }
  });
}

/**
 * Hard delete a prescription (use with caution!)
 */
export async function hardDeletePrescription(db: PrismaClient, id: string): Promise<Prescription> {
  if (!id) {
    throw new Error('Prescription ID is required for deletion');
  }

  return db.prescription.delete({
    where: { id }
  });
}

/**
 * Update prescription status
 */
export async function updatePrescriptionStatus(
  db: PrismaClient,
  id: string,
  status: 'active' | 'completed' | 'cancelled'
): Promise<Prescription> {
  if (!id) {
    throw new Error('Prescription ID is required');
  }

  return db.prescription.update({
    where: { id },
    data: { status }
  });
}

// ==================== BULK OPERATIONS ====================

const prescriptionExpiringSoonInclude = {
  doctor: {
    select: {
      id: true,
      name: true
    }
  },
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true
    }
  },
  prescribedItems: {
    include: {
      drug: {
        select: {
          id: true,
          name: true
        }
      }
    }
  }
} satisfies Prisma.PrescriptionInclude;

export type PrescriptionExpiringSoon = Prisma.PrescriptionGetPayload<{
  include: typeof prescriptionExpiringSoonInclude;
}>;

/**
 * Find prescriptions expiring soon (for notifications)
 */
export async function findPrescriptionsExpiringSoon(
  db: PrismaClient,
  clinicId: string,
  daysThreshold = 7
): Promise<PrescriptionExpiringSoon[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysThreshold);

  return db.prescription.findMany({
    where: {
      clinicId,
      status: 'active',
      endDate: {
        lte: futureDate,
        gte: new Date()
      }
    },
    include: prescriptionExpiringSoonInclude,
    orderBy: { endDate: 'asc' }
  });
}

/**
 * Bulk update prescription statuses
 */
export async function bulkUpdatePrescriptionStatus(
  db: PrismaClient,
  ids: string[],
  status: 'active' | 'completed' | 'cancelled'
): Promise<Prisma.BatchPayload> {
  if (!ids.length) {
    throw new Error('At least one prescription ID is required');
  }

  return db.prescription.updateMany({
    where: {
      id: { in: ids }
    },
    data: { status }
  });
}
