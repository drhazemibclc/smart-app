import { TRPCError } from '@trpc/server';

import { cacheHelpers } from '../../../lib/cache';
import { processRevenueData } from '../../../utils/bill';
import { billingQueries } from '../repositories';
import { validateClinicAccess } from '../repositories/validation.repo';
import type { PaymentMethod, PaymentStatus } from '../types';

export class BillingService {
  // ==================== QUERIES ====================

  async getPaymentById(id: string, clinicId: string) {
    const payment = await billingQueries.getPaymentById(id);

    if (!payment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Payment not found'
      });
    }

    // Verify clinic access
    if (payment.clinicId !== clinicId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied'
      });
    }

    return payment;
  }

  async getPaymentsByPatient(
    patientId: string,
    // clinicId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: PaymentStatus;
    }
  ) {
    // Verify patient belongs to clinic (handled by validation middleware)
    return billingQueries.getPaymentsByPatient(patientId, {
      limit: options?.limit,
      offset: options?.offset,
      status: options?.status as PaymentStatus | undefined
    });
  }

  async getPaymentsByClinic(
    clinicId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      status?: PaymentStatus;
    }
  ) {
    return billingQueries.getPaymentsByClinic(clinicId, options);
  }

  async getPaymentStats(clinicId: string, startDate: Date, endDate: Date) {
    const stats = await billingQueries.getPaymentStats(clinicId, startDate, endDate);

    // Calculate additional metrics - convert Decimal to number
    const totalPaid = stats.byStatus
      .filter(s => s.status === 'PAID')
      .reduce((sum, s) => sum + Number(s._sum?.amount || 0), 0);

    const totalPending = stats.byStatus
      .filter(s => ['UNPAID', 'PARTIAL'].includes(s.status))
      .reduce((sum, s) => sum + Number(s._sum?.amount || 0), 0);

    const totalRevenueNum = Number(stats.totalRevenue);

    return {
      ...stats,
      totalPaid,
      totalPending,
      collectionRate: totalRevenueNum > 0 ? (totalPaid / totalRevenueNum) * 100 : 0
    };
  }

  async getOverduePayments(clinicId: string) {
    const overdue = await billingQueries.getOverduePayments(clinicId);

    // Calculate days overdue
    const today = new Date();
    return overdue.map(payment => ({
      ...payment,
      daysOverdue: payment.dueDate
        ? Math.floor((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    }));
  }

  async getMonthlyRevenue(clinicId: string, months = 12) {
    const payments = await billingQueries.getMonthlyRevenue(clinicId, months);
    // Convert Decimal amounts to numbers for processing
    const paymentsWithNumbers = payments.map(p => ({
      ...p,
      amount: Number(p.amount)
    }));
    return processRevenueData(paymentsWithNumbers, months);
  }

  async getServices(clinicId: string) {
    return billingQueries.getServices(clinicId);
  }

  // ==================== MUTATIONS ====================

  async createPayment(
    input: {
      clinicId: string;
      patientId: string;
      appointmentId: string;
      amount: number;
      discount?: number;
      paymentMethod: PaymentMethod;
      status: PaymentStatus;
      notes?: string;
      dueDate?: Date;
      bills: Array<{
        serviceId: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        serviceDate: Date;
      }>;
    },
    userId: string
  ) {
    // Validate clinic access
    const db = await import('../client').then(m => m.db);
    await validateClinicAccess(db, input.clinicId, userId);

    // Business rules
    if (input.amount <= 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Amount must be greater than 0'
      });
    }

    if (input.discount && (input.discount < 0 || input.discount > input.amount)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid discount amount'
      });
    }

    // Calculate total from bills if not provided
    const calculatedTotal = input.bills.reduce((sum, bill) => sum + bill.totalCost, 0);
    if (Math.abs(calculatedTotal - input.amount) > 0.01) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Bill total does not match payment amount'
      });
    }

    // Create payment
    const payment = await billingQueries.createPayment(input);

    // Invalidate cache
    cacheHelpers.billing.invalidateClinic(input.clinicId);
    cacheHelpers.patient.invalidateBilling(input.patientId, input.clinicId);
    cacheHelpers.clinic.invalidate(input.clinicId);
    cacheHelpers.clinic.invalidateDashboard(input.clinicId);

    return payment;
  }

  async updatePayment(
    id: string,
    clinicId: string,
    input: {
      amount?: number;
      discount?: number;
      paymentMethod?: PaymentMethod;
      status?: PaymentStatus;
      notes?: string;
      paidDate?: Date | null;
    },
    userId: string
  ) {
    // Get existing payment
    const existing = await billingQueries.getPaymentById(id);
    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Payment not found'
      });
    }

    // Verify clinic access
    if (existing.clinicId !== clinicId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied'
      });
    }

    const db = await import('../client').then(m => m.db);
    await validateClinicAccess(db, clinicId, userId);

    // Update payment
    const updated = await billingQueries.updatePayment(id, input);

    // Invalidate cache
    cacheHelpers.billing.invalidate(id, clinicId);
    if (existing.patientId) {
      cacheHelpers.patient.invalidateBilling(existing.patientId, clinicId);
    }
    cacheHelpers.billing.invalidateStats(clinicId);
    cacheHelpers.clinic.invalidateDashboard(clinicId);

    return updated;
  }

  async deletePayment(id: string, clinicId: string, userId: string) {
    // Get existing payment
    const existing = await billingQueries.getPaymentById(id);
    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Payment not found'
      });
    }

    // Verify clinic access
    if (existing.clinicId !== clinicId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied'
      });
    }

    const db = await import('../client').then(m => m.db);
    await validateClinicAccess(db, clinicId, userId);

    // Soft delete
    await billingQueries.deletePayment(id);

    // Invalidate cache
    cacheHelpers.billing.invalidate(id, clinicId);
    if (existing.patientId) {
      cacheHelpers.patient.invalidateBilling(existing.patientId, clinicId);
    }
    cacheHelpers.billing.invalidateStats(clinicId);
    cacheHelpers.clinic.invalidateDashboard(clinicId);
  }

  async processPayment(id: string, clinicId: string, userId: string) {
    return this.updatePayment(
      id,
      clinicId,
      {
        status: 'PAID',
        paidDate: new Date()
      },
      userId
    );
  }
}

export const billingService = new BillingService();
