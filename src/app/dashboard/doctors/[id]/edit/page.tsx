import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth-server';
import { doctorService } from '@/server/db/services';

import { EditDoctorForm } from '../../_components/edit-doctor-form';

interface EditDoctorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditDoctorPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Doctor ${id}`,
    description: 'Edit doctor information'
  };
}

async function EditDoctorContent({ doctorId }: { doctorId: string }) {
  const session = await getSession();

  if (!session?.user?.clinic?.id) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>No clinic found. Please contact support.</p>
      </div>
    );
  }

  const doctorData = await doctorService.getDoctorById(doctorId, session.user.clinic.id);

  if (!doctorData) {
    notFound();
  }

  // Type assertion for the doctor data
  const rawDoctor = doctorData as {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    licenseNumber?: string;
    specialty: string;
    appointmentPrice: number;
    workSchedule?: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };

  // Transform the doctor data to match the form structure
  const doctor = {
    id: rawDoctor.id,
    clinicId: session.user.clinic.id,
    name: rawDoctor.name || '',
    email: rawDoctor.email || '',
    phone: rawDoctor.phone || '',
    licenseNumber: rawDoctor.licenseNumber || '',
    specialty: rawDoctor.specialty || '',
    appointmentPrice: rawDoctor.appointmentPrice || 0,
    workSchedule: (rawDoctor.workSchedule || []).map(wd => ({
      day: wd.day as 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday',
      startTime: wd.startTime,
      endTime: wd.endTime
    }))
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor Information</CardTitle>
        <CardDescription>Update the doctor details below. Fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <EditDoctorForm
          doctor={doctor}
          doctorId={doctorId}
        />
      </CardContent>
    </Card>
  );
}

async function EditDoctorWrapper({ params }: EditDoctorPageProps) {
  const { id } = await params;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-4'>
        <Button
          asChild
          size='icon'
          variant='outline'
        >
          <Link href={`/dashboard/doctors/${id}`}>
            <ChevronLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h1 className='font-semibold text-3xl tracking-tight'>Edit Doctor</h1>
          <p className='text-muted-foreground text-sm'>Update doctor information</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className='h-96 w-full' />}>
        <EditDoctorContent doctorId={id} />
      </Suspense>
    </div>
  );
}

export default function EditDoctorPage({ params }: EditDoctorPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditDoctorWrapper params={params} />
    </Suspense>
  );
}
