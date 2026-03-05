// src/server/db/services/prescription.service.ts
import logger from '@/logger';

import type { Prisma } from '../../../generated/prisma/browser';
import { diagnosisRepo } from '..';
import prisma from '../client';
import { labTestRepo, medicalRecordRepo, prescriptionRepo, validationRepo, vitalSignsRepo } from '../repositories';
import type {
  PrescriptionStats,
  PrescriptionWithFullRelations,
  PrescriptionWithMedicalRelations
} from '../repositories/prescription.repo';
import { calculateAge } from '../utils';

interface PrescriptionTrendRaw {
  year: number;
  month: string; // or number depending on your repo
  status: string;
  count: bigint | number;
}

interface MonthlyTrend {
  month: string;
  monthName: string;
  year: number;
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  growth: number;
}
export class PrescriptionService {
  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Get prescription by ID with full relations
   */
  async getPrescriptionById(id: string, clinicId: string): Promise<PrescriptionWithFullRelations | null> {
    try {
      if (!id) {
        throw new Error('Prescription ID is required');
      }

      const prescription = await prescriptionRepo.findPrescriptionById(this.db, id);

      // If prescription not found, return null
      if (!prescription) {
        return null;
      }

      // Verify clinic access through patient's clinicId
      if (prescription.patient?.clinicId !== clinicId) {
        logger.warn('Clinic access violation', {
          prescriptionId: id,
          requestedClinicId: clinicId,
          actualClinicId: prescription.patient?.clinicId
        });
        return null;
      }

      return prescription;
    } catch (error) {
      logger.error('Failed to get prescription by id', { error, id, clinicId });
      throw new Error('Failed to retrieve prescription');
    }
  }

  /**
   * Get prescriptions by medical record
   */
  async getPrescriptionsByMedicalRecord(
    medicalRecordId: string,
    clinicId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<PrescriptionWithMedicalRelations[]> {
    try {
      // Get the medical record first to verify clinic access
      const medicalRecord = await medicalRecordRepo.findMedicalRecordById(this.db, medicalRecordId);

      if (!medicalRecord || medicalRecord.patient?.clinicId !== clinicId) {
        return [];
      }

      const prescriptions = await prescriptionRepo.findPrescriptionsByMedicalRecord(this.db, medicalRecordId, options);

      return prescriptions;
    } catch (error) {
      logger.error('Failed to get prescriptions by medical record', { error, medicalRecordId, clinicId });
      throw new Error('Failed to retrieve prescriptions');
    }
  }

  /**
   * Get active prescriptions by patient
   */
  async getPatientActivePrescriptions(patientId: string, clinicId: string) {
    try {
      // Validate patient exists and belongs to clinic
      const patient = await validationRepo.checkPatientExists(this.db, patientId, clinicId);
      if (!patient) {
        return [];
      }

      const prescriptions = await prescriptionRepo.findActivePrescriptionsByPatient(this.db, patientId, new Date());

      return prescriptions;
    } catch (error) {
      logger.error('Failed to get active prescriptions', { error, patientId, clinicId });
      throw new Error('Failed to retrieve prescriptions');
    }
  }

  /**
   * Get all prescriptions for a patient (history)
   */
  async getPatientPrescriptionHistory(
    patientId: string,
    clinicId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeInactive?: boolean;
    }
  ) {
    try {
      // Validate patient exists and belongs to clinic
      const patient = await validationRepo.checkPatientExists(this.db, patientId, clinicId);
      if (!patient) {
        return [];
      }

      const prescriptions = await prescriptionRepo.findPrescriptionsByPatient(this.db, patientId, options);

      return prescriptions;
    } catch (error) {
      logger.error('Failed to get prescription history', { error, patientId, clinicId });
      throw new Error('Failed to retrieve prescription history');
    }
  }

  /**
   * Get all prescriptions for a clinic (admin view)
   */
  async getClinicPrescriptions(
    clinicId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: 'active' | 'completed' | 'cancelled';
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    try {
      const prescriptions = await prescriptionRepo.findPrescriptionsByClinic(this.db, clinicId, options);

      return {
        items: prescriptions,
        total: prescriptions.length,
        limit: options?.limit || 100,
        offset: options?.offset || 0
      };
    } catch (error) {
      logger.error('Failed to get clinic prescriptions', { error, clinicId });
      throw new Error('Failed to retrieve clinic prescriptions');
    }
  }

  /**
   * Get prescription count for clinic
   */
  async getPrescriptionCount(clinicId: string, status?: 'active' | 'completed' | 'cancelled'): Promise<number> {
    try {
      const where: Prisma.PrescriptionWhereInput = { clinicId };

      if (status) {
        where.status = status;
      }

      return await prescriptionRepo.countPrescriptions(this.db, where);
    } catch (error) {
      logger.error('Failed to get prescription count', { error, clinicId });
      throw new Error('Failed to retrieve prescription count');
    }
  }

  /**
   * Get prescriptions expiring soon (for notifications)
   */
  async getPrescriptionsExpiringSoon(clinicId: string, daysThreshold = 7) {
    try {
      const expiringPrescriptions = await prescriptionRepo.findPrescriptionsExpiringSoon(
        this.db,
        clinicId,
        daysThreshold
      );

      return expiringPrescriptions;
    } catch (error) {
      logger.error('Failed to get expiring prescriptions', { error, clinicId });
      throw new Error('Failed to retrieve expiring prescriptions');
    }
  }
  /**
   * Get prescription statistics for clinic
   */
  async getPrescriptionStats(clinicId: string, startDate?: Date, endDate?: Date) {
    try {
      const where: Prisma.PrescriptionWhereInput = {
        clinicId,
        createdAt: {
          gte: startDate ? startDate.toISOString() : undefined,
          lte: endDate ? endDate.toISOString() : undefined
        }
      };

      const whereStr = JSON.stringify(where);
      const result = await prescriptionRepo.getPrescriptionStats(this.db, whereStr);

      return result;
    } catch (error) {
      logger.error('Failed to get prescription stats', { error, clinicId });
      throw new Error('Failed to retrieve prescription stats');
    }
  }
  // ==================== COMPREHENSIVE PATIENT MEDICAL DATA ====================

  /**
   * Get patient medical summary (includes prescriptions)
   */
  async getPatientMedicalSummary(patientId: string, clinicId: string) {
    try {
      // Validate patient exists and belongs to clinic
      const patient = await validationRepo.checkPatientExists(this.db, patientId, clinicId);
      if (!patient) {
        return null;
      }

      // Run queries in parallel for performance
      const [diagnoses, medicalRecords, labTests, vitals, prescriptions] = await Promise.all([
        diagnosisRepo.findDiagnosesByPatient(this.db, patientId, { limit: 10 }),
        medicalRecordRepo.findMedicalRecordsByPatient(this.db, patientId, { limit: 5 }),
        labTestRepo.findLabTestsByPatient(this.db, patientId, { limit: 10 }),
        vitalSignsRepo.findVitalSignsByPatient(this.db, patientId, { limit: 20 }),
        prescriptionRepo.findActivePrescriptionsByPatient(this.db, patientId, new Date())
      ]);

      const summary = {
        patient: {
          id: patientId,
          age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : null
        },
        stats: {
          totalDiagnoses: diagnoses.length,
          totalRecords: medicalRecords.length,
          totalLabTests: labTests.length,
          activePrescriptions: prescriptions.length
        },
        recentData: {
          diagnoses: diagnoses.slice(0, 3),
          labTests: labTests.slice(0, 3),
          vitals: vitals.slice(0, 5),
          upcomingAppointments: [] // Would be fetched from appointment service
        }
      };

      return summary;
    } catch (error) {
      logger.error('Failed to get patient medical summary', { error, patientId, clinicId });
      throw new Error('Failed to retrieve medical summary');
    }
  }

  // ==================== MUTATIONS ====================

  /**
   * Create a new prescription
   */
  async createPrescription(
    data: Parameters<typeof prescriptionRepo.createPrescription>[1] & { clinicId: string },
    userId: string
  ) {
    try {
      // Validate patient belongs to clinic
      const patient = await validationRepo.checkPatientExists(this.db, data.patientId, data.clinicId);
      if (!patient) {
        throw new Error('Patient not found or access denied');
      }

      // Validate medical record exists and belongs to patient
      const medicalRecord = await medicalRecordRepo.findMedicalRecordById(this.db, data.medicalRecordId);
      if (!medicalRecord || medicalRecord.patientId !== data.patientId) {
        throw new Error('Invalid medical record for this patient');
      }

      // Create prescription
      const prescription = await prescriptionRepo.createPrescription(this.db, {
        ...data
        // Add any audit fields if needed
        // createdById: userId,
        // createdAt: new Date()
      });

      logger.info('Prescription created', { prescriptionId: prescription.id, userId });

      return prescription;
    } catch (error) {
      logger.error('Failed to create prescription', { error, data, userId });
      throw error instanceof Error ? error : new Error('Failed to create prescription');
    }
  }

  /**
   * Update a prescription
   */
  async updatePrescription(
    id: string,
    clinicId: string,
    data: Parameters<typeof prescriptionRepo.updatePrescription>[2],
    userId: string
  ) {
    try {
      // First get the prescription to verify clinic access
      const existing = await this.getPrescriptionById(id, clinicId);
      if (!existing) {
        throw new Error('Prescription not found or access denied');
      }

      // Update prescription
      const updated = await prescriptionRepo.updatePrescription(this.db, id, {
        ...data
        // Add audit fields if needed
        // updatedById: userId,
        // updatedAt: new Date()
      });

      logger.info('Prescription updated', { prescriptionId: id, userId });

      return updated;
    } catch (error) {
      logger.error('Failed to update prescription', { error, id, userId });
      throw error instanceof Error ? error : new Error('Failed to update prescription');
    }
  }

  /**
   * Complete a prescription (set status to completed)
   */
  async completePrescription(id: string, clinicId: string, userId: string) {
    try {
      // First get the prescription to verify clinic access
      const existing = await this.getPrescriptionById(id, clinicId);
      if (!existing) {
        throw new Error('Prescription not found or access denied');
      }

      // Update status to completed
      const updated = await prescriptionRepo.updatePrescriptionStatus(this.db, id, 'completed');

      logger.info('Prescription completed', { prescriptionId: id, userId });

      return updated;
    } catch (error) {
      logger.error('Failed to complete prescription', { error, id, userId });
      throw error instanceof Error ? error : new Error('Failed to complete prescription');
    }
  }

  /**
   * Cancel a prescription
   */
  async cancelPrescription(id: string, clinicId: string, userId: string) {
    try {
      // First get the prescription to verify clinic access
      const existing = await this.getPrescriptionById(id, clinicId);
      if (!existing) {
        throw new Error('Prescription not found or access denied');
      }

      // Update status to cancelled
      const updated = await prescriptionRepo.updatePrescriptionStatus(this.db, id, 'cancelled');

      logger.info('Prescription cancelled', { prescriptionId: id, userId });

      return updated;
    } catch (error) {
      logger.error('Failed to cancel prescription', { error, id, userId });
      throw error instanceof Error ? error : new Error('Failed to cancel prescription');
    }
  }

  /**
   * Delete prescription (soft delete)
   */
  async deletePrescription(id: string, clinicId: string, userId: string) {
    try {
      // First get the prescription to verify clinic access
      const existing = await this.getPrescriptionById(id, clinicId);
      if (!existing) {
        throw new Error('Prescription not found or access denied');
      }

      // Soft delete
      const deleted = await prescriptionRepo.softDeletePrescription(this.db, id);

      logger.info('Prescription deleted', { prescriptionId: id, userId });

      return deleted;
    } catch (error) {
      logger.error('Failed to delete prescription', { error, id, userId });
      throw error instanceof Error ? error : new Error('Failed to delete prescription');
    }
  }

  // ==================== NEW STATISTICS METHODS ====================

  /**
   * Get prescription statistics by date range
   * Returns counts broken down by status within the specified date range
   */
  async getPrescriptionStatsByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PrescriptionStats & { dateRange: { start: string; end: string } }> {
    try {
      // Validate clinic access will be handled by caller

      // Validate date range
      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

      // Validate dates are not in the future (optional)
      const now = new Date();
      if (startDate > now) {
        throw new Error('Start date cannot be in the future');
      }

      logger.debug('Fetching prescription stats by date range', {
        clinicId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Get stats from repository
      const stats = await prescriptionRepo.getStatsByDateRange(this.db, clinicId, startDate, endDate);
      return {
        ...stats,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
        // trends: {
        //   total: Math.round(totalChange * 10) / 10, // Round to 1 decimal
        //   active: stats.active - previousStats.active,
        //   completed: stats.completed - previousStats.completed
        // },
        // previousPeriod: {
        //   total: previousStats.total,
        //   active: previousStats.active,
        //   completed: previousStats.completed
        // }
      };
    } catch (error) {
      logger.error('Failed to get prescription stats by date range', {
        error,
        clinicId,
        startDate,
        endDate
      });
      throw new Error('Failed to retrieve prescription statistics');
    }
  }

  /**
   * Get prescription statistics for a specific month
   * Convenience method for monthly reports
   */
  async getPrescriptionStatsForMonth(
    clinicId: string,
    year: number,
    month: number
  ): Promise<PrescriptionStats & { month: string; year: number }> {
    try {
      // Validate month (1-12)
      if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
      }

      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

      const stats = await this.getPrescriptionStatsByDateRange(clinicId, startDate, endDate);

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      return {
        ...stats,
        month: monthNames[month - 1],
        year
      };
    } catch (error) {
      logger.error('Failed to get monthly prescription stats', {
        error,
        clinicId,
        year,
        month
      });
      throw new Error('Failed to retrieve monthly statistics');
    }
  }

  /**
   * Get monthly prescription trends for the last N months
   * Returns time-series data for charts and analytics
   */
  async getPrescriptionMonthlyTrends(clinicId: string, months = 12): Promise<MonthlyTrend[]> {
    try {
      // Validate months parameter
      if (months < 1 || months > 36) {
        throw new Error('Months must be between 1 and 36');
      }

      logger.debug('Fetching monthly prescription trends', {
        clinicId,
        months
      });

      // Get raw trends from repository - type this properly
      const rawTrends = (await prescriptionRepo.getMonthlyTrends(this.db, clinicId, months)) as PrescriptionTrendRaw[];

      // Group by month and transform into structured format
      const trendsMap = new Map<string, MonthlyTrend>();

      for (const item of rawTrends) {
        const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
        const monthIndex = Number.parseInt(String(item.month), 10) - 1;

        if (!trendsMap.has(monthKey)) {
          trendsMap.set(monthKey, {
            month: monthKey,
            monthName: new Date(item.year, monthIndex, 1).toLocaleString('default', {
              month: 'short'
            }),
            year: item.year,
            total: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
            growth: 0
          });
        }

        const trend = trendsMap.get(monthKey);
        if (trend) {
          const count = Number(item.count);
          trend.total += count;

          // Add to specific status count
          switch (item.status) {
            case 'active':
              trend.active += count;
              break;
            case 'completed':
              trend.completed += count;
              break;
            case 'cancelled':
              trend.cancelled += count;
              break;
            // Handle other statuses if needed
            default:
              // For any other status, just add to total
              break;
          }
        }
      }

      // Calculate month-over-month growth
      const trends = Array.from(trendsMap.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month.localeCompare(b.month);
      });

      for (let i = 1; i < trends.length; i++) {
        const prevTotal = trends[i - 1].total;
        if (prevTotal > 0) {
          trends[i].growth = Math.round(((trends[i].total - prevTotal) / prevTotal) * 100 * 10) / 10;
        }
      }

      return trends;
    } catch (error) {
      logger.error('Failed to get monthly trends', { error, clinicId, months });
      throw new Error('Failed to retrieve monthly trends');
    }
  }
  /**
   * Get prescription statistics comparison between two periods
   * Useful for growth analysis
   */
  async comparePrescriptionPeriods(
    clinicId: string,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date
  ): Promise<{
    period1: PrescriptionStats & { dateRange: { start: string; end: string } };
    period2: PrescriptionStats & { dateRange: { start: string; end: string } };
    changes: {
      total: number; // percentage change
      active: number; // absolute change
      completed: number; // absolute change
      cancelled: number; // absolute change
    };
  }> {
    try {
      const [period1Stats, period2Stats] = await Promise.all([
        this.getPrescriptionStatsByDateRange(clinicId, period1Start, period1End),
        this.getPrescriptionStatsByDateRange(clinicId, period2Start, period2End)
      ]);

      const totalChange =
        period1Stats.total > 0 ? ((period2Stats.total - period1Stats.total) / period1Stats.total) * 100 : 0;

      return {
        period1: period1Stats,
        period2: period2Stats,
        changes: {
          total: Math.round(totalChange * 10) / 10,
          active: period2Stats.active - period1Stats.active,
          completed: period2Stats.completed - period1Stats.completed,
          cancelled: period2Stats.cancelled - period1Stats.cancelled
        }
      };
    } catch (error) {
      logger.error('Failed to compare prescription periods', {
        error,
        clinicId,
        period1Start,
        period1End,
        period2Start,
        period2End
      });
      throw new Error('Failed to compare prescription periods');
    }
  }
}

export const prescriptionService = new PrescriptionService();
export default PrescriptionService;
