// src/app/(protected)/prescriptions/new/page.tsx

import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { getSession } from '../../../../lib/auth-server';
import { getCachedDoctorList, getCachedPatientById } from '../../../../lib/cache/admin.cache';
import { getCachedDrugDatabase } from '../../../../lib/cache/prescription.cache';
import { PrescriptionForm } from '../_components/PrescriptionForm';

interface NewPrescriptionPageProps {
  searchParams: Promise<{
    patientId?: string;
    medicalRecordId?: string;
    encounterId?: string;
  }>;
}

export default async function NewPrescriptionPage({ searchParams }: NewPrescriptionPageProps) {
  const session = await getSession();
  if (!session?.user?.clinic?.id) notFound();

  // Only doctors can create prescriptions
  if (session.user.role !== 'DOCTOR') {
    notFound();
  }

  const { patientId, medicalRecordId, encounterId } = await searchParams;
  const clinicId = session.user.clinic.id;

  // Fetch data in parallel
  const [patient, doctors, drugs] = await Promise.all([
    patientId ? getCachedPatientById(patientId, clinicId) : null,
    getCachedDoctorList(clinicId).then(res => (Array.isArray(res) ? res : [])),
    getCachedDrugDatabase()
  ]);

  return (
    <div className='container mx-auto max-w-4xl py-6'>
      <Card>
        <CardHeader>
          <CardTitle>Create New Prescription</CardTitle>
          <CardDescription>
            Enter the prescription details below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<FormSkeleton />}>
            <PrescriptionForm
              clinicId={clinicId}
              doctorId={session.user.id}
              doctors={doctors}
              drugs={drugs}
              initialEncounterId={encounterId}
              initialMedicalRecordId={medicalRecordId}
              initialPatient={patient} // Assuming user.id is the doctor ID
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-32 w-full' />
      <Skeleton className='h-48 w-full' />
      <Skeleton className='h-10 w-32' />
    </div>
  );
}
