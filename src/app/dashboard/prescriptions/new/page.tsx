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

async function NewPrescriptionContent({
  clinicId,
  doctorId,
  patientId,
  medicalRecordId,
  encounterId
}: {
  clinicId: string;
  doctorId: string;
  patientId?: string;
  medicalRecordId?: string;
  encounterId?: string;
}) {
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
              doctorId={doctorId}
              doctors={doctors}
              drugs={drugs}
              initialEncounterId={encounterId}
              initialMedicalRecordId={medicalRecordId}
              initialPatient={patient}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function NewPrescriptionWrapper({ searchParams }: NewPrescriptionPageProps) {
  const session = await getSession();
  if (!session?.user?.clinic?.id) notFound();

  // Only doctors can create prescriptions
  if (session.user.role !== 'DOCTOR') {
    notFound();
  }

  const { patientId, medicalRecordId, encounterId } = await searchParams;

  return (
    <NewPrescriptionContent
      clinicId={session.user.clinic.id}
      doctorId={session.user.id}
      encounterId={encounterId}
      medicalRecordId={medicalRecordId}
      patientId={patientId}
    />
  );
}

export default function NewPrescriptionPage({ searchParams }: NewPrescriptionPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPrescriptionWrapper searchParams={searchParams} />
    </Suspense>
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
