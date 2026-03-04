import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/server/api/utils';
import { patientService } from '@/server/db/services';

import { PatientDetailClient } from '../_components/patient-detail-client';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

// export async function generateMetadata({ params }: PatientDetailPageProps): Promise<Metadata> {
//   const { slug } = await params;  // Must await!
//   const post = await getPost(slug);

//   return {
//     title: post?.title || 'Post Not Found',
//     description: post?.excerpt,
//   };
// }
export async function generateMetadata({ params }: PatientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Patient ${id}`,
    description: 'View patient details'
  };
}

async function PatientDetailContent({ patientId }: { patientId: string }) {
  const session = await getSession();

  if (!session?.user?.clinic?.id) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>No clinic found. Please contact support.</p>
      </div>
    );
  }

  try {
    const patient = await patientService.getPatientFullDataById(patientId, session.user.clinic.id);

    if (!patient) {
      notFound();
    }

    return <PatientDetailClient patient={patient} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = await params;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-4'>
        <Button
          asChild
          size='icon'
          variant='outline'
        >
          <Link href='/dashboard/patients'>
            <ChevronLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h1 className='font-semibold text-3xl tracking-tight'>Patient Details</h1>
          <p className='text-muted-foreground text-sm'>View and manage patient information</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className='space-y-4'>
            <Skeleton className='h-48 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        }
      >
        <PatientDetailContent patientId={id} />
      </Suspense>
    </div>
  );
}
