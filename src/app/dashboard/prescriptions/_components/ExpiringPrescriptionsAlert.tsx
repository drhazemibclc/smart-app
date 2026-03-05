'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/server/db/utils';
import { trpc } from '@/utils/trpc';

interface ExpiringPrescriptionsAlertProps {
  clinicId: string;
}

export function ExpiringPrescriptionsAlert({ clinicId }: ExpiringPrescriptionsAlertProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    trpc.prescription.getExpiringSoon.queryOptions({
      clinicId,
      daysThreshold: 7
    })
  );

  const prescriptions = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return <Skeleton className='h-24 w-full rounded-lg' />;
  }

  if (!prescriptions.length) {
    return null;
  }

  const previewItems = prescriptions.slice(0, 5);

  return (
    <Alert className='border-amber-500 bg-amber-50 dark:bg-amber-950'>
      <AlertCircle className='h-4 w-4 text-amber-600' />

      <AlertTitle className='text-amber-800 dark:text-amber-300'>Prescriptions Expiring Soon</AlertTitle>

      <AlertDescription className='space-y-3 text-amber-700 dark:text-amber-400'>
        <p>
          {prescriptions.length} prescription
          {prescriptions.length > 1 ? 's' : ''} will expire within the next 7 days.
        </p>

        <div className='max-h-36 space-y-2 overflow-y-auto rounded-md border border-amber-200 bg-white p-2 dark:border-amber-800 dark:bg-amber-900/40'>
          {previewItems.map(p => (
            <div
              className='flex items-center justify-between text-sm'
              key={p.id}
            >
              <span className='truncate'>
                {p.patient?.firstName} {p.patient?.lastName}
                {' — '}
                {p.medicationName ?? `${p.prescribedItems?.length ?? 0} items`}
              </span>

              <span className='ml-2 flex items-center whitespace-nowrap text-xs'>
                <Calendar className='mr-1 h-3 w-3' />
                {p.endDate ? formatDateTime(p.endDate) : 'Unknown'}
              </span>
            </div>
          ))}
        </div>

        <Button
          className='border-amber-300 bg-amber-100 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900'
          onClick={() => router.push('/prescriptions?status=active&sort=endDate')}
          size='sm'
          variant='outline'
        >
          View All Expiring
        </Button>
      </AlertDescription>
    </Alert>
  );
}
