import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSession } from '@/lib/auth-server';

import { NewDoctorForm } from '../_components/new-doctor-form';

export const metadata: Metadata = {
  title: 'New Doctor',
  description: 'Add a new doctor'
};

async function NewDoctorContent() {
  const session = await getSession();

  if (!session?.user?.clinic?.id) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>No clinic found. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-4'>
        <Button
          asChild
          size='icon'
          variant='outline'
        >
          <Link href='/dashboard/doctors'>
            <ChevronLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h1 className='font-semibold text-3xl tracking-tight'>New Doctor</h1>
          <p className='text-muted-foreground text-sm'>Add a new doctor to your clinic</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
          <CardDescription>Enter the doctor details below. Fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewDoctorForm clinicId={session.user.clinic.id} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewDoctorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewDoctorContent />
    </Suspense>
  );
}
