// apps/web/src/app/(dashboard)/appointments/[id]/page.tsx

import { redirect } from 'next/navigation';

import { HydrateClient, prefetch } from '@/trpc/server';
import { trpc } from '@/utils/trpc';

import { getSession } from '../../../../lib/auth-server';
import { AppointmentDetails } from '../_components/appointment-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppointmentDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user) redirect('/login');

  // Prefetch appointment data
  await prefetch(trpc.appointment.getById.queryOptions({ id }));

  return (
    <HydrateClient>
      <AppointmentDetails id={id} />
    </HydrateClient>
  );
}
