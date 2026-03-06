// apps/web/src/app/(dashboard)/appointments/[id]/page.tsx

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { HydrateClient, prefetch } from '@/trpc/server';
import { trpc } from '@/utils/trpc';

import { getSession } from '../../../../lib/auth-server';
import { AppointmentDetails } from '../_components/appointment-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function AppointmentDetailsContent({ appointmentId }: { appointmentId: string }) {
  const session = await getSession();

  if (!session?.user) redirect('/login');

  // Prefetch appointment data
  void prefetch(trpc.appointment.getById.queryOptions({ id: appointmentId }));

  return (
    <HydrateClient>
      <AppointmentDetails id={appointmentId} />
    </HydrateClient>
  );
}

async function AppointmentDetailsWrapper({ params }: PageProps) {
  const { id } = await params;

  return <AppointmentDetailsContent appointmentId={id} />;
}

export default function AppointmentDetailsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading appointment...</div>}>
      <AppointmentDetailsWrapper params={params} />
    </Suspense>
  );
}
