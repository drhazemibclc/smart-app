// src/app/(protected)/prescriptions/[id]/page.tsx

import { ArrowLeft, Download, Edit, Printer } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { getSession } from '../../../../lib/auth-server';
import { getCachedPrescriptionById } from '../../../../lib/cache/prescription.cache';
import type { Prescription } from '../../../../server/db/types';
import type { PrescriptionWithRelations } from '../../../../types/prescription';
import { PrescriptionDetail } from '../_components/PrescriptionDetail';

interface PrescriptionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PrescriptionDetailPage({ params }: PrescriptionDetailPageProps) {
  const session = await getSession();
  if (!session?.user?.clinic?.id) notFound();

  const { id } = await params;
  const clinicId = session.user.clinic.id;

  const prescription = await getCachedPrescriptionById(id, clinicId);

  if (!prescription) {
    notFound();
  }

  const canEdit = session.user.role === 'DOCTOR';
  const canPrint = true; // Based on permissions

  return (
    <div className='container mx-auto space-y-6 py-6'>
      {/* Header with Actions */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl tracking-tight'>Prescription Details</h1>
          <p className='text-muted-foreground'>View and manage prescription information</p>
        </div>
        <PrescriptionActions
          canEdit={canEdit}
          canPrint={canPrint}
          prescription={prescription}
        />
      </div>

      {/* Prescription Detail */}
      <Card>
        <CardContent className='pt-6'>
          <Suspense fallback={<DetailSkeleton />}>
            <PrescriptionDetail prescription={prescription as unknown as PrescriptionWithRelations} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Related Information */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Patient Info Card */}
        <Card>
          <CardContent className='pt-6'>
            <h3 className='mb-4 font-semibold'>Patient Information</h3>
            <Suspense fallback={<Skeleton className='h-32' />}>
              <PatientInfo patientId={prescription.patientId} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Doctor Info Card */}
        <Card>
          <CardContent className='pt-6'>
            <h3 className='mb-4 font-semibold'>Prescribing Doctor</h3>
            <Suspense fallback={<Skeleton className='h-32' />}>
              <DoctorInfo doctorId={prescription.doctorId ?? ''} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Medical Record Link */}
      {prescription.medicalRecordId && typeof prescription.medicalRecordId === 'string' && (
        <Card>
          <CardContent className='pt-6'>
            <h3 className='mb-4 font-semibold'>Associated Medical Record</h3>
            <Suspense fallback={<Skeleton className='h-24' />}>
              <MedicalRecordInfo medicalRecordId={prescription.medicalRecordId as string} />
            </Suspense>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PrescriptionActions({
  canEdit,
  canPrint,
  prescription
}: {
  canEdit: boolean;
  canPrint: boolean;
  prescription: Prescription;
}) {
  return (
    <div className='flex items-center gap-2'>
      <Button
        asChild
        size='sm'
        variant='outline'
      >
        <Link href='/dashboard/prescriptions'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Link>
      </Button>
      {canPrint && (
        <Button
          size='sm'
          variant='outline'
        >
          <Printer className='mr-2 h-4 w-4' />
          Print
        </Button>
      )}
      <Button
        size='sm'
        variant='outline'
      >
        <Download className='mr-2 h-4 w-4' />
        Download
      </Button>
      {canEdit && (
        <Button
          asChild
          size='sm'
        >
          <Link href={`/dashboard/prescriptions/${prescription.id}/edit`}>
            <Edit className='mr-2 h-4 w-4' />
            Edit
          </Link>
        </Button>
      )}
    </div>
  );
}

async function PatientInfo({ patientId }: { patientId: string }) {
  return <div className='text-sm'>Patient ID: {patientId}</div>;
}

async function DoctorInfo({ doctorId }: { doctorId: string }) {
  return <div className='text-sm'>Doctor ID: {doctorId}</div>;
}

async function MedicalRecordInfo({ medicalRecordId }: { medicalRecordId: string }) {
  return <div className='text-sm'>Record ID: {medicalRecordId}</div>;
}

function DetailSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-8 w-1/3' />
      <Skeleton className='h-32 w-full' />
      <Skeleton className='h-48 w-full' />
    </div>
  );
}
