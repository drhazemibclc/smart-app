import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PatientListClient } from './_components/patient-list-client';
import { PatientListSkeleton } from './_components/patient-list-skeleton';

export const metadata: Metadata = {
  title: 'Patients',
  description: 'Manage your patients'
};

export default function PatientsPage() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-semibold text-3xl tracking-tight'>Patients</h1>
          <p className='text-muted-foreground text-sm'>Manage and view all your patients</p>
        </div>
      </div>

      <Suspense fallback={<PatientListSkeleton />}>
        <PatientListClient />
      </Suspense>
    </div>
  );
}
