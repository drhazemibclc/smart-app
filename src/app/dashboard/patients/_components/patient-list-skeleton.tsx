import { useId } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PatientListSkeleton() {
  const Id = useId();
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Skeleton className='h-10 flex-1' />
          <div className='flex gap-2'>
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-9 w-32' />
          </div>
        </div>

        <div className='space-y-3'>
          {Array.from({ length: 5 }).map(_ => (
            <div
              className='flex items-center gap-4 rounded-lg border p-4'
              key={Id}
            >
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-48' />
                <Skeleton className='h-3 w-32' />
              </div>
              <Skeleton className='h-8 w-20' />
              <Skeleton className='h-8 w-8' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
