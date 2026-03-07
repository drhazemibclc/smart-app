// src/modules/billing/billing.utils.ts
import { differenceInDays, format } from 'date-fns';

import type { PaymentMethod, PaymentStatus } from '@/db/types';

export function processRevenueData(
  payments: Array<{ amount: number | null; paymentDate: Date | null; paymentMethod: string }>,
  months: number
) {
  const monthlyData = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = format(date, 'MMM yyyy');

    const monthPayments = payments.filter(p => {
      if (!p.paymentDate) return false;
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getMonth() === date.getMonth() && paymentDate.getFullYear() === date.getFullYear();
    });

    const cashTotal = monthPayments
      .filter(p => p.paymentMethod === 'CASH')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const cardTotal = monthPayments
      .filter(p => p.paymentMethod === 'CARD')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const mobileTotal = monthPayments
      .filter(p => p.paymentMethod === 'MOBILE')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    monthlyData.push({
      month: monthStr,
      cash: cashTotal,
      card: cardTotal,
      mobile: mobileTotal,
      total: cashTotal + cardTotal + mobileTotal
    });
  }

  return monthlyData;
}

export function calculateTax(amount: number, taxRate = 0.16): number {
  return amount * taxRate;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function calculateDueDate(daysFromNow = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

export function getPaymentStatusColor(status: string): string {
  const colors = {
    PAID: 'text-green-600 bg-green-100',
    UNPAID: 'text-red-600 bg-red-100',
    PARTIAL: 'text-yellow-600 bg-yellow-100',
    REFUNDED: 'text-purple-600 bg-purple-100'
  };
  return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
}

export function getPaymentMethodIcon(method: string): string {
  const icons = {
    CASH: '💵',
    CARD: '💳',
    MOBILE: '📱'
  };
  return icons[method as keyof typeof icons] || '💰';
}

// ==================== FORMATTING UTILITIES ====================

/**
 * Format currency amount to USD string
 */

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string | null | undefined, formatStr = 'MMM dd, yyyy'): string {
  if (!date) return 'N/A';

  try {
    return format(new Date(date), formatStr);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
}

/**
 * Format payment method with icon and text
 */
export function formatPaymentMethod(method: PaymentMethod | string | null | undefined): {
  icon: string;
  text: string;
  color: string;
} {
  const methods = {
    CASH: { icon: '💵', text: 'Cash', color: 'text-green-600' },
    CARD: { icon: '💳', text: 'Card', color: 'text-blue-600' },
    MOBILE: { icon: '📱', text: 'Mobile', color: 'text-purple-600' },
    INSURANCE: { icon: '🏥', text: 'Insurance', color: 'text-orange-600' },
    BANK_TRANSFER: { icon: '🏦', text: 'Bank Transfer', color: 'text-indigo-600' },
    CHEQUE: { icon: '📝', text: 'Cheque', color: 'text-gray-600' }
  };

  const defaultMethod = { icon: '💰', text: 'Other', color: 'text-gray-600' };

  if (!method) return defaultMethod;
  return methods[method as keyof typeof methods] || defaultMethod;
}

/**
 * Get status color and label
 */
export function getPaymentStatusInfo(status: PaymentStatus | string | null | undefined): {
  color: string;
  bgColor: string;
  label: string;
  icon: string;
} {
  const statuses = {
    PAID: {
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      label: 'Paid',
      icon: '✅'
    },
    UNPAID: {
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      label: 'Unpaid',
      icon: '⏳'
    },
    PARTIAL: {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      label: 'Partial',
      icon: '⚠️'
    },
    REFUNDED: {
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      label: 'Refunded',
      icon: '↩️'
    },
    CANCELLED: {
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      label: 'Cancelled',
      icon: '❌'
    }
  };

  const defaultStatus = {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    label: 'Unknown',
    icon: '❓'
  };

  if (!status) return defaultStatus;
  return statuses[status as keyof typeof statuses] || defaultStatus;
}

/**
 * Get status color class for styling
 */

/**
 * Calculate subtotal from bill items
 */
export function calculateSubtotal(items: Array<{ quantity: number; unitCost: number }>): number {
  return items.reduce((sum, item) => {
    return sum + item.quantity * item.unitCost;
  }, 0);
}

/**
 * Calculate total after discount
 */
export function calculateTotal(subtotal: number, discount = 0): number {
  const total = subtotal - discount;
  return total > 0 ? Number(total.toFixed(2)) : 0;
}

/**
 * Calculate days until due
 */
export function calculateDaysUntilDue(dueDate: Date | null | undefined): number | null {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return differenceInDays(due, today);
}

/**
 * Calculate days overdue
 */
export function calculateDaysOverdue(dueDate: Date | null | undefined): number {
  if (!dueDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return today > due ? differenceInDays(today, due) : 0;
}

/**
 * Calculate payment progress percentage
 */
export function calculatePaymentProgress(amountPaid: number | null, totalAmount: number | null): number {
  if (!amountPaid || !totalAmount || totalAmount === 0) return 0;
  return Math.min(100, Math.round((amountPaid / totalAmount) * 100));
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalAmount: number, discountedAmount: number): number {
  if (originalAmount <= 0) return 0;
  const discount = originalAmount - discountedAmount;
  return Math.round((discount / originalAmount) * 100);
}

// ==================== DATA PROCESSING UTILITIES ====================

/**
 * Group payments by status
 */
export function groupPaymentsByStatus<T extends { status: string; amount: number | null }>(payments: Array<T>) {
  return payments.reduce(
    (acc, payment) => {
      const status = payment.status;
      if (!acc[status]) {
        acc[status] = {
          count: 0,
          total: 0,
          payments: []
        };
      }
      acc[status].count++;
      acc[status].total += payment.amount || 0;
      acc[status].payments.push(payment);
      return acc;
    },
    {} as Record<string, { count: number; total: number; payments: T[] }>
  );
}

/**
 * Group payments by payment method
 */
export function groupPaymentsByMethod(payments: Array<{ paymentMethod: string; amount: number | null }>) {
  return payments.reduce(
    (acc, payment) => {
      const method = payment.paymentMethod;
      if (!acc[method]) {
        acc[method] = {
          count: 0,
          total: 0
        };
      }
      acc[method].count++;
      acc[method].total += payment.amount || 0;
      return acc;
    },
    {} as Record<string, { count: number; total: number }>
  );
}

/**
 * Calculate payment statistics
 */
export function calculatePaymentStats(payments: Array<{ amount: number | null; status: string }>) {
  const totalPayments = payments.length;
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const paidPayments = payments.filter(p => p.status === 'PAID');
  const unpaidPayments = payments.filter(p => p.status === 'UNPAID');
  const partialPayments = payments.filter(p => p.status === 'PARTIAL');

  const paidTotal = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const unpaidTotal = unpaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const partialTotal = partialPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    totalPayments,
    totalRevenue,
    paidCount: paidPayments.length,
    unpaidCount: unpaidPayments.length,
    partialCount: partialPayments.length,
    paidTotal,
    unpaidTotal,
    partialTotal,
    collectionRate: totalRevenue > 0 ? (paidTotal / totalRevenue) * 100 : 0,
    averagePayment: totalPayments > 0 ? totalRevenue / totalPayments : 0
  };
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Check if payment is overdue
 */
export function isPaymentOverdue(payment: { status: string; dueDate: Date | null }): boolean {
  if (!payment.dueDate) return false;
  if (payment.status === 'PAID' || payment.status === 'REFUNDED') return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(payment.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return today > dueDate;
}

/**
 * Check if payment is due soon (within X days)
 */
export function isPaymentDueSoon(payment: { status: string; dueDate: Date | null }, daysThreshold = 7): boolean {
  if (!payment.dueDate) return false;
  if (payment.status === 'PAID' || payment.status === 'REFUNDED') return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(payment.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = differenceInDays(dueDate, today);
  return daysUntilDue > 0 && daysUntilDue <= daysThreshold;
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): { valid: boolean; message?: string } {
  if (amount <= 0) {
    return { valid: false, message: 'Amount must be greater than 0' };
  }
  if (amount > 1000000) {
    return { valid: false, message: 'Amount exceeds maximum limit' };
  }
  return { valid: true };
}

/**
 * Validate discount amount
 */
export function validateDiscount(discount: number, totalAmount: number): { valid: boolean; message?: string } {
  if (discount < 0) {
    return { valid: false, message: 'Discount cannot be negative' };
  }
  if (discount > totalAmount) {
    return { valid: false, message: 'Discount cannot exceed total amount' };
  }
  return { valid: true };
}

// ==================== INVOICE UTILITIES ====================

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(prefix = 'INV', clinicCode = '001'): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `${prefix}-${clinicCode}-${year}${month}${day}-${random}`;
}

/**
 * Format invoice amount in words (for checks)
 */
export function amountInWords(amount: number): string {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : '');
    if (n < 1000) return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${numToWords(n % 100)}` : ''}`;
    if (n < 100000) return `${numToWords(Math.floor(n / 1000))} Thousand${n % 1000 ? ` ${numToWords(n % 1000)}` : ''}`;
    return 'Number too large';
  };

  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  let result = `${numToWords(dollars)} Dollar${dollars !== 1 ? 's' : ''}`;
  if (cents > 0) {
    result += ` and ${numToWords(cents)} Cent${cents !== 1 ? 's' : ''}`;
  }

  return result;
}

// ==================== REPORTING UTILITIES ====================

/**
 * Generate payment summary for reports
 */
export function generatePaymentSummary(
  payments: Array<{
    amount: number | null;
    status: string;
    paymentMethod: string;
    createdAt: Date;
  }>,
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'yearly':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
  }

  const filteredPayments = payments.filter(p => p.createdAt >= startDate);

  return {
    period,
    totalPayments: filteredPayments.length,
    totalRevenue: filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    byStatus: groupPaymentsByStatus(filteredPayments),
    byMethod: groupPaymentsByMethod(filteredPayments),
    averagePerDay: filteredPayments.length / (period === 'monthly' ? 30 : 7)
  };
}

/**
 * Calculate revenue growth percentage
 */
export function calculateRevenueGrowth(currentPeriodRevenue: number, previousPeriodRevenue: number): number {
  if (previousPeriodRevenue === 0) return currentPeriodRevenue > 0 ? 100 : 0;
  return ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
}

// ==================== EXPORT ====================

export const billingUtils = {
  // Formatting
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPaymentMethod,
  getPaymentStatusInfo,
  getPaymentStatusColor,
  getPaymentMethodIcon,

  // Calculations
  calculateTax,
  calculateSubtotal,
  calculateTotal,
  calculateDueDate,
  calculateDaysUntilDue,
  calculateDaysOverdue,
  calculatePaymentProgress,
  calculateDiscountPercentage,

  // Data Processing
  processRevenueData,
  groupPaymentsByStatus,
  groupPaymentsByMethod,
  calculatePaymentStats,

  // Validation
  isPaymentOverdue,
  isPaymentDueSoon,
  validatePaymentAmount,
  validateDiscount,

  // Invoice
  generateInvoiceNumber,
  amountInWords,

  // Reporting
  generatePaymentSummary,
  calculateRevenueGrowth
};
