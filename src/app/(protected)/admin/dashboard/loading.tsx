// app/(protected)/admin/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function StatCardsSkeleton() {
  return (
    <div className='flex w-full flex-wrap gap-5'>
      {[1, 2, 3, 4].map(i => (
        <Skeleton
          className='h-32 w-64'
          key={i}
        />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <Skeleton className='h-125 w-full' />;
}

export function RecentAppointmentsSkeleton() {
  return <Skeleton className='h-64 w-full' />;
}

export function StatSummarySkeleton() {
  return <Skeleton className='h-112.5 w-full' />;
}

export function AvailableDoctorsSkeleton() {
  return <Skeleton className='mt-4 h-96 w-full' />;
}
