// apps/web/src/app/(dashboard)/appointments/components/appointment-stats-cards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AppointmentStatsCardsProps {
  stats?: {
    totalAppointments: number;
    byStatus?: Record<string, number>;
  };
  todayCount: number;
  todayList: Array<{ status: string }>;
}

export function AppointmentStatsCards({ todayCount, stats, todayList }: AppointmentStatsCardsProps) {
  const checkedIn = todayList.filter(a => a.status === 'CHECKED_IN').length;
  const scheduled = todayList.filter(a => a.status === 'SCHEDULED').length;
  const completed = stats?.byStatus?.COMPLETED || 0;
  const noShows = stats?.byStatus?.NO_SHOW || 0;

  return (
    <div className='mb-8 grid gap-4 md:grid-cols-4'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='font-medium text-sm'>Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='font-bold text-2xl'>{todayCount}</div>
          <p className='text-muted-foreground text-xs'>
            {scheduled} scheduled, {checkedIn} checked in
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='font-medium text-sm'>This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='font-bold text-2xl'>{stats?.totalAppointments || 0}</div>
          <p className='text-muted-foreground text-xs'>{completed} completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='font-medium text-sm'>Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='font-bold text-2xl'>{checkedIn}</div>
          <p className='text-muted-foreground text-xs'>Waiting to be seen</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='font-medium text-sm'>No Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='font-bold text-2xl'>{noShows}</div>
          <p className='text-muted-foreground text-xs'>This month</p>
        </CardContent>
      </Card>
    </div>
  );
}
