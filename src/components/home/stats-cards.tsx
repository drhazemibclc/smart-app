// components/home/stats-cards.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Baby, Calendar, Heart, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import { trpc } from '@/utils/trpc';

export function StatsCards() {
  const { data: session, isPending } = useSession();
  const isAuthenticated = Boolean(session?.user && !isPending);

  const { data: stats, isLoading } = useQuery(
    trpc.clinic.getStats.queryOptions(undefined, {
      enabled: isAuthenticated, // Only fetch when authenticated
      staleTime: 5 * 60 * 1000 // 5 minutes
    })
  );

  // Show placeholder stats for unauthenticated users
  if (!isAuthenticated) {
    const placeholderStats = [
      {
        title: 'Expert Care',
        value: '500+',
        icon: Users,
        description: 'Happy families served',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20'
      },
      {
        title: 'Years Experience',
        value: '15+',
        icon: Heart,
        description: 'Combined pediatric expertise',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20'
      },
      {
        title: 'Comprehensive Services',
        value: '20+',
        icon: Calendar,
        description: 'Pediatric specialties',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20'
      },
      {
        title: '24/7 Support',
        value: 'Always',
        icon: Baby,
        description: 'When you need us most',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20'
      }
    ];

    return (
      <div className='grid gap-4 md:grid-cols-4'>
        {placeholderStats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='font-medium text-sm'>{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className='font-bold text-2xl'>{stat.value}</div>
                <p className='text-muted-foreground text-xs'>{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  const statItems = [
    {
      title: 'Happy Families',
      value: stats?.totalDoctors?.toLocaleString() ?? '0',
      icon: Users,
      description: 'Trusted by families',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Annual Visits',
      value: stats?.totalAppointments?.toLocaleString() ?? '0',
      icon: Heart,
      description: 'Happy Families',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Happy Families',
      value: stats?.totalPatients?.toLocaleString() ?? '0',
      icon: Calendar,
      description: 'Appointments yearly',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Clinic Features',
      value: stats?.completedAppointments?.toLocaleString() ?? '0',
      icon: Baby,
      description: 'Completed Appointments',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className='grid gap-4 md:grid-cols-4'>
      {statItems.map(stat => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='font-medium text-sm'>{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='font-bold text-2xl'>
                {isLoading ? <div className='h-8 w-16 animate-pulse rounded bg-gray-200' /> : stat.value}
              </div>
              <p className='text-muted-foreground text-xs'>{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
