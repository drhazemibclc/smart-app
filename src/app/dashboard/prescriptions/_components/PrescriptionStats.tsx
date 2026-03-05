// src/app/(protected)/prescriptions/components/PrescriptionStats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';

interface PrescriptionStatsProps {
  clinicId: string;
}

export function PrescriptionStats({ clinicId }: PrescriptionStatsProps) {
  const { data, isLoading } = useQuery(
    trpc.prescription.getPrescriptionStats.queryOptions({
      clinicId
    })
  );

  const stats = useMemo(
    () => [
      {
        title: 'Total Prescriptions',
        value: data?.total ?? 0,
        icon: Activity,
        color: 'text-blue-600'
      },
      {
        title: 'Active',
        value: data?.active ?? 0,
        icon: Clock,
        color: 'text-green-600'
      },
      {
        title: 'Completed',
        value: data?.completed ?? 0,
        icon: CheckCircle,
        color: 'text-purple-600'
      },
      {
        title: 'Cancelled',
        value: data?.cancelled ?? 0,
        icon: XCircle,
        color: 'text-red-600'
      }
    ],
    [data]
  );

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map(stat => (
        <Card key={stat.title}>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='font-medium text-sm'>{stat.title}</CardTitle>

            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>

          <CardContent>
            <div className='font-bold text-2xl'>{isLoading ? '...' : stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
