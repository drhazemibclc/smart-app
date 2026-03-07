// src/modules/billing/components/loading.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BillingStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {[1, 2, 3, 4].map(i => (
        <Skeleton
          className='h-32'
          key={i}
        />
      ))}
    </div>
  );
}

export function RevenueChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-32' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-80' />
      </CardContent>
    </Card>
  );
}

export function OverduePaymentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-40' />
      </CardHeader>
      <CardContent className='space-y-4'>
        {[1, 2, 3].map(i => (
          <Skeleton
            className='h-24'
            key={i}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentPaymentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-32' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-64' />
      </CardContent>
    </Card>
  );
}
