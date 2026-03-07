import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DoctorListClient } from './_components/doctor-list-client';
import { DoctorListSkeleton } from './_components/doctor-list-skeleton';

export const metadata: Metadata = {
  title: 'Doctors',
  description: 'Manage your doctors'
};

export default function DoctorsPage() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-semibold text-3xl tracking-tight'>Doctors</h1>
          <p className='text-muted-foreground text-sm'>Manage and view all your doctors</p>
        </div>
      </div>

      <Suspense fallback={<DoctorListSkeleton />}>
        <DoctorListClient />
      </Suspense>
    </div>
  );
}
