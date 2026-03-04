'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Calendar, FileText, Users } from 'lucide-react';
import { useId } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/utils/trpc';

interface MedicalStatsCardsProps {
  clinicId: string;
}

interface StatItem {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number | string;
}

export function MedicalStatsCards({ clinicId }: MedicalStatsCardsProps) {
  const Id = useId();

  const { data: summary, isLoading } = useQuery({
    ...trpc.clinic.getMedicalRecordsSummary.queryOptions({ clinicId }),
    enabled: true
  });

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-4'>
        {[...Array(4)].map(_ => (
          <Card key={Id}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      title: 'Total Records',
      value: summary?.totalRecords || 0,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'This Month',
      value: summary?.currentMonthCount || 0,
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      title: 'Last Month',
      value: summary?.previousMonthCount || 0,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Growth',
      value: `${summary?.growth || 0}%`,
      icon: AlertCircle,
      color: summary?.growth && summary.growth > 0 ? 'text-green-500' : 'text-red-500'
    }
  ];

  return (
    <div className='grid gap-4 md:grid-cols-4'>
      {stats.map(stat => (
        <Card key={stat.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='font-medium text-sm'>{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className='font-bold text-2xl'>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
