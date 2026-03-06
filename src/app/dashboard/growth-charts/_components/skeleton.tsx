// src/app/dashboard/growth-charts/_components/skeleton.tsx
export function GrowthChartsSkeleton() {
  return (
    <div className='space-y-4 p-4'>
      <div className='h-8 w-64 animate-pulse rounded bg-gray-200' />
      <div className='h-[400px] animate-pulse rounded bg-gray-200' />
      <div className='grid grid-cols-3 gap-4'>
        {[...Array(3)].map((_, i) => (
          <div
            className='h-32 animate-pulse rounded bg-gray-200'
            key={i}
          />
        ))}
      </div>
    </div>
  );
}
