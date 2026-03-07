// src/app/(protected)/billing/page.tsx (alternative version)
import { Suspense } from 'react';

import { getSession } from '@/lib/auth-server';
import { HydrateClient, prefetch, trpc } from '@/trpc/server';

import { BillingDashboard } from './_components/client';
import { BillingStatsSkeleton } from './_components/loading';
import { NewPaymentButton } from './_components/new-pay';
export default async function BillingPage() {
  const session = await getSession();
  const clinicId = session?.user?.clinic?.id;

  if (!clinicId) {
    return <div>No clinic access</div>;
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  await Promise.all([
    prefetch(trpc.Payment.getStats.queryOptions({ startDate, endDate })),
    prefetch(trpc.Payment.getMonthlyRevenue.queryOptions({ months: 12 })),
    prefetch(trpc.Payment.getOverdue.queryOptions()),
    prefetch(trpc.Payment.getByClinic.queryOptions({ limit: 10 }))
  ]);

  return (
    <HydrateClient>
      <div className='container mx-auto space-y-6 py-6'>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold text-3xl'>Billing & Payments</h1>
          <NewPaymentButton />
        </div>

        <Suspense fallback={<BillingStatsSkeleton />}>
          <BillingDashboard />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
