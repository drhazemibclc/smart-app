// src/app/(protected)/prescriptions/page.tsx

import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { getSession } from '../../../lib/auth-server';
import { ExpiringPrescriptionsAlert } from './_components/ExpiringPrescriptionsAlert';
import { PrescriptionFilters } from './_components/PrescriptionFilters';
import { PrescriptionList } from './_components/PrescriptionList';
import { PrescriptionStats } from './_components/PrescriptionStats';

interface PrescriptionsPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
    limit?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

async function PrescriptionsContent({
  clinicId,
  status,
  page,
  limit,
  startDate,
  endDate
}: {
  clinicId: string;
  status?: string;
  page: string;
  limit: string;
  startDate?: string;
  endDate?: string;
}) {
  const currentPage = Number.parseInt(page, 10);
  const pageLimit = Number.parseInt(limit, 10);
  const offset = (currentPage - 1) * pageLimit;

  // Parse date filters
  const parsedStartDate = startDate ? new Date(startDate) : undefined;
  const parsedEndDate = endDate ? new Date(endDate) : undefined;

  return (
    <div className='container mx-auto space-y-6 py-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl tracking-tight'>Prescriptions</h1>
          <p className='text-muted-foreground'>Manage and track all prescriptions across the clinic</p>
        </div>
      </div>

      {/* Expiring Prescriptions Alert */}
      <Suspense fallback={<Skeleton className='h-20 w-full' />}>
        <ExpiringPrescriptionsAlert clinicId={clinicId} />
      </Suspense>

      {/* Stats Cards */}
      <Suspense fallback={<StatsSkeleton />}>
        <PrescriptionStats clinicId={clinicId} />
      </Suspense>

      {/* Filters */}
      <PrescriptionFilters
        initialEndDate={endDate}
        initialStartDate={startDate}
        initialStatus={status}
      />

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
          <CardDescription>View and manage all prescriptions in your clinic</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ListSkeleton />}>
            <PrescriptionList
              clinicId={clinicId}
              endDate={parsedEndDate}
              limit={pageLimit}
              offset={offset}
              startDate={parsedStartDate}
              status={status as 'active' | 'completed' | 'cancelled' | undefined}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function PrescriptionsWrapper({ searchParams }: PrescriptionsPageProps) {
  const session = await getSession();
  if (!session?.user?.clinic?.id) notFound();

  const { status, page = '1', limit = '20', startDate, endDate } = await searchParams;

  return (
    <PrescriptionsContent
      clinicId={session.user.clinic.id}
      endDate={endDate}
      limit={limit}
      page={page}
      startDate={startDate}
      status={status}
    />
  );
}

export default function PrescriptionsPage({ searchParams }: PrescriptionsPageProps) {
  return (
    <Suspense fallback={<div>Loading prescriptions...</div>}>
      <PrescriptionsWrapper searchParams={searchParams} />
    </Suspense>
  );
}

function StatsSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className='pb-2'>
            <Skeleton className='h-4 w-24' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-16' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(5)].map((_, i) => (
        <div
          className='flex items-center space-x-4'
          key={i}
        >
          <Skeleton className='h-12 w-12 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[250px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>
      ))}
    </div>
  );
}
