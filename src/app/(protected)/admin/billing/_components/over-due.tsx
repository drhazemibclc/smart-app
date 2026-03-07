// src/modules/billing/components/overdue-payments-list.tsx
'use client';

import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/bill';

interface OverduePaymentsListProps {
  payments: Array<{
    id: string;
    amount: number | null;
    dueDate: Date | null;
    daysOverdue: number;
    patient: {
      firstName: string;
      lastName: string;
      phone: string | null;
    } | null;
    appointment: {
      doctor: { name: string } | null;
    } | null;
  }>;
}

export function OverduePaymentsList({ payments }: OverduePaymentsListProps) {
  if (payments.length === 0) {
    return (
      <div className='py-8 text-center text-gray-500'>
        <AlertCircle className='mx-auto mb-2 h-8 w-8' />
        <p>No overdue payments</p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {payments.map(payment => (
        <div
          className='rounded-lg border p-3'
          key={payment.id}
        >
          <div className='mb-2 flex items-start justify-between'>
            <div>
              <p className='font-medium'>
                {payment.patient?.firstName} {payment.patient?.lastName}
              </p>
              <p className='text-gray-600 text-sm'>Dr. {payment.appointment?.doctor?.name}</p>
            </div>
            <Badge variant='destructive'>{payment.daysOverdue} days overdue</Badge>
          </div>

          <div className='mt-2 flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>
                Due: {payment.dueDate ? format(new Date(payment.dueDate), 'MMM dd, yyyy') : 'N/A'}
              </p>
              <p className='font-semibold text-red-600'>{formatCurrency(payment.amount)}</p>
            </div>
            <Button
              size='sm'
              variant='outline'
            >
              Send Reminder
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
