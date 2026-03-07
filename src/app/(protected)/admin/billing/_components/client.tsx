// src/modules/billing/components/billing-dashboard.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import type Decimal from 'decimal.js';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTRPC } from '@/trpc/client';

import { OverduePaymentsList } from './over-due';
import { PaymentsTable } from './payment-table';
import { RevenueChart } from './revenue-chart';
import { StatsCards } from './stats-card';

// Helper to convert Decimal to number
const toNumber = (value: number | { toNumber: () => number } | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  return typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value);
};

export function BillingDashboard() {
  const trpc = useTRPC();

  // All queries use the prefetched data from the server
  const { data: statsData } = useQuery(
    trpc.Payment.getStats.queryOptions({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date()
    })
  );

  const { data: revenueData } = useQuery(trpc.Payment.getMonthlyRevenue.queryOptions({ months: 12 }));

  const { data: overdueData } = useQuery(trpc.Payment.getOverdue.queryOptions(undefined));

  const { data: paymentsData } = useQuery(trpc.Payment.getByClinic.queryOptions({ limit: 10 }));

  if (!statsData || !revenueData || !overdueData || !paymentsData) {
    return <div>Loading...</div>;
  }

  // Transform stats data to match expected format
  const stats = {
    totalRevenue: toNumber(statsData.totalRevenue),
    totalPaid: toNumber(statsData.totalPaid),
    totalPending: toNumber(statsData.totalPending),
    paidCount: statsData.paidCount,
    collectionRate: statsData.collectionRate
  };

  // Transform revenue data
  const revenue = revenueData.map(
    (item: {
      month: string;
      cash: number | Decimal;
      card: number | Decimal;
      mobile: number | Decimal;
      total: number | Decimal;
    }) => ({
      month: item.month,
      cash: toNumber(item.cash),
      card: toNumber(item.card),
      mobile: toNumber(item.mobile),
      total: toNumber(item.total)
    })
  );

  // Transform overdue data
  const overdue = overdueData.map(item => ({
    id: item.id,
    amount: item.amount ? toNumber(item.amount) : null,
    dueDate: item.dueDate,
    daysOverdue: item.daysOverdue,
    patient: item.patient
      ? {
          firstName: item.patient.firstName,
          lastName: item.patient.lastName,
          phone: item.patient.phone
        }
      : null,
    appointment: item.appointment
      ? {
          doctor: item.appointment.doctor
            ? {
                name: item.appointment.doctor.name
              }
            : null
        }
      : null
  }));

  // Transform payments data - getPaymentsByClinic returns array directly
  const payments = paymentsData.map(item => ({
    id: item.id,
    amount: item.amount ? toNumber(item.amount) : null,
    status: item.status,
    paymentMethod: item.paymentMethod,
    billDate: item.billDate,
    dueDate: item.dueDate,
    patient: item.patient
      ? {
          id: item.patient.id,
          firstName: item.patient.firstName,
          lastName: item.patient.lastName
        }
      : null,
    appointment: item.appointment
      ? {
          doctor: item.appointment.doctor
            ? {
                name: item.appointment.doctor.name
              }
            : null
        }
      : null
  }));

  return (
    <>
      <StatsCards stats={stats} />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <OverduePaymentsList payments={overdue} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable payments={payments} />
        </CardContent>
      </Card>
    </>
  );
}
