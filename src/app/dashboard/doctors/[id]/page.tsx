import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth-server';
import { doctorService } from '@/server/db/services';

import { DoctorDetailClient } from '../_components/doctor-detail-client';

interface DoctorDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DoctorDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Doctor ${id}`,
    description: 'View doctor details'
  };
}

async function DoctorDetailContent({ doctorId }: { doctorId: string }) {
  const session = await getSession();

  if (!session?.user?.clinic?.id) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>No clinic found. Please contact support.</p>
      </div>
    );
  }

  try {
    const doctor = await doctorService.getDoctorById(doctorId, session.user.clinic.id);

    if (!doctor) {
      notFound();
    }

    // @ts-expect-error -- Prisma type mismatch with component interface
    return <DoctorDetailClient doctor={doctor} />;
  } catch (error: unknown) {
    console.error(error);
    notFound();
  }
}

async function DoctorDetailWrapper({ params }: DoctorDetailPageProps) {
  const { id } = await params;

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
          <h1 className='font-semibold text-3xl tracking-tight'>Doctor Details</h1>
          <p className='text-muted-foreground text-sm'>View and manage doctor information</p>
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
        <DoctorDetailContent doctorId={id} />
      </Suspense>
    </div>
  );
}

export default function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorDetailWrapper params={params} />
    </Suspense>
  );
}
