// src/modules/billing/billing.schema.ts
import { z } from 'zod';

import { PaymentMethod, PaymentStatus } from '../server/db/types';

export const BillItemSchema = z.object({
  serviceId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitCost: z.number().positive(),
  totalCost: z.number().positive(),
  serviceDate: z.date()
});

export const CreatePaymentSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(PaymentMethod),
  status: z.enum(PaymentStatus),
  bills: z.array(BillItemSchema).min(1),
  discount: z.number().min(0).optional(),
  notes: z.string().optional(),
  dueDate: z.date().optional()
});

export const UpdatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.enum(PaymentMethod).optional(),
  status: z.enum(PaymentStatus).optional(),
  notes: z.string().optional(),
  paidDate: z.date().nullable().optional()
});

export const GetPaymentsSchema = z.object({
  patientId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  status: z.enum(PaymentStatus).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

export const PaymentIdSchema = z.object({
  id: z.string().uuid()
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
export type GetPaymentsInput = z.infer<typeof GetPaymentsSchema>;
export type BillItemInput = z.infer<typeof BillItemSchema>;
