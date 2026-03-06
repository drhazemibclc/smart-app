// src/app/(protected)/prescriptions/patient/[patientId]/page.tsx

import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth-server';
import { getCachedPatientById } from '@/lib/cache/admin.cache';

import { PatientPrescriptionHistory } from '../../_components/PatientPrescriptionHistory';

interface PatientPrescriptionsPageProps {
  params: Promise<{
    patientId: string;
  }>;
}

async function PatientPrescriptionsContent({ patientId, clinicId }: { patientId: string; clinicId: string }) {
  // Verify patient exists
  const patient = await getCachedPatientById(patientId, clinicId);
  if (!patient) notFound();

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div>
        <h1 className='font-bold text-3xl tracking-tight'>Prescription History</h1>
        <p className='text-muted-foreground'>
          Patient: {patient.firstName} {patient.lastName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<HistorySkeleton />}>
            <PatientPrescriptionHistory
              clinicId={clinicId}
              patientId={patientId}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function PatientPrescriptionsWrapper({ params }: PatientPrescriptionsPageProps) {
  const session = await getSession();
  if (!session?.user?.clinic?.id) notFound();

  const { patientId } = await params;

  return (
    <PatientPrescriptionsContent
      clinicId={session.user.clinic.id}
      patientId={patientId}
    />
  );
}

export default function PatientPrescriptionsPage({ params }: PatientPrescriptionsPageProps) {
  return (
    <Suspense fallback={<div>Loading patient prescriptions...</div>}>
      <PatientPrescriptionsWrapper params={params} />
    </Suspense>
  );
}

function HistorySkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(5)].map((_, i) => (
        <Skeleton
          className='h-24 w-full'
          key={i}
        />
      ))}
    </div>
  );
}
