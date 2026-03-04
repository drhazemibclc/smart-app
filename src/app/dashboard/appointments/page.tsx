// apps/web/src/app/(dashboard)/appointments/page.tsx

import { redirect } from 'next/navigation';

import { trpc } from '@/utils/trpc';

import { getSession } from '../../../lib/auth-server';
import { HydrateClient, prefetch } from '../../../trpc/server';
import { AppointmentsClient } from './_components/appointments-client';

export default async function AppointmentsPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  // Prefetch data for immediate display
  await Promise.all([
    prefetch(trpc.appointment.today.queryOptions()),
    prefetch(trpc.appointment.stats.queryOptions({ period: 'month' })),
    prefetch(
      trpc.appointment.list.queryOptions({
        page: 1,
        clinic: session.user.clinic?.id || '',
        updatedAt: new Date(),
        limit: 20,
        startDate: new Date(),
        endDate: new Date()
      })
    )
  ]);

  return (
    <HydrateClient>
      <AppointmentsClient />
    </HydrateClient>
  );
}
