// apps/web/src/app/(dashboard)/appointments/new/page.tsx

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { HydrateClient, prefetch } from '@/trpc/server';
import { trpc } from '@/utils/trpc';

import { getSession } from '../../../../lib/auth-server';
import { AppointmentForm } from '../_components/appointment-form';

async function NewAppointmentContent() {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  // Prefetch necessary data
  void prefetch(trpc.doctor.list.queryOptions({ clinicId: session.user?.clinic?.id }));
  void prefetch(trpc.patient.list.queryOptions({ clinicId: session.user?.clinic?.id, limit: 100 }));
  void prefetch(trpc.service.list.queryOptions({ clinicId: session.user?.clinic?.id }));

  return (
    <HydrateClient>
      <div className='container mx-auto max-w-3xl py-8'>
        <h1 className='mb-6 font-bold text-2xl'>Schedule New Appointment</h1>
        <AppointmentForm />
      </div>
    </HydrateClient>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewAppointmentContent />
    </Suspense>
  );
}
