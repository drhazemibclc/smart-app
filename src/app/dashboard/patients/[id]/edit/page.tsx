import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth-server';
import { patientService } from '@/server/db/services';

import type { Gender } from '../../../../../generated/prisma/enums';
import { EditPatientForm } from '../../_components/edit-patient-form';

interface EditPatientPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditPatientPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Patient ${id}`,
    description: 'Edit patient information'
  };
}

async function EditPatientContent({ patientId }: { patientId: string }) {
  const session = await getSession();

  if (!session?.user?.clinic?.id) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>No clinic found. Please contact support.</p>
      </div>
    );
  }

  const patientData = await patientService.getPatientById(patientId, session.user.clinic.id);

  if (!patientData) {
    notFound();
  }

  // Type assertion needed due to Prisma's complex return types
  const rawPatient = patientData as unknown as {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: Gender;
    email: string | null;
    phone: string | null;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactNumber: string | null;
    bloodGroup: string | null;
    allergies: string | null;
    medicalConditions: string | null;
    medicalHistory: string | null;
  };

  // Extract only the fields needed for the form
  const patient = {
    id: rawPatient.id,
    firstName: rawPatient.firstName,
    lastName: rawPatient.lastName,
    dateOfBirth: rawPatient.dateOfBirth,
    gender: rawPatient.gender,
    email: rawPatient.email,
    phone: rawPatient.phone,
    address: rawPatient.address,
    emergencyContactName: rawPatient.emergencyContactName,
    emergencyContactNumber: rawPatient.emergencyContactNumber,
    bloodGroup: rawPatient.bloodGroup,
    allergies: rawPatient.allergies,
    medicalConditions: rawPatient.medicalConditions,
    medicalHistory: rawPatient.medicalHistory
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
        <CardDescription>Update the patient details below. Fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <EditPatientForm
          patient={patient}
          patientId={patientId}
        />
      </CardContent>
    </Card>
  );
}

async function EditPatientWrapper({ params }: EditPatientPageProps) {
  const { id } = await params;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-4'>
        <Button
          asChild
          size='icon'
          variant='outline'
        >
          <Link href={`/dashboard/patients/${id}`}>
            <ChevronLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h1 className='font-semibold text-3xl tracking-tight'>Edit Patient</h1>
          <p className='text-muted-foreground text-sm'>Update patient information</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className='h-96 w-full' />}>
        <EditPatientContent patientId={id} />
      </Suspense>
    </div>
  );
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPatientWrapper params={params} />
    </Suspense>
  );
}
