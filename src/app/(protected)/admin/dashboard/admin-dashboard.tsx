// app/(protected)/admin/dashboard/client.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { BriefcaseBusiness, BriefcaseMedical, User, Users } from 'lucide-react';

import { AvailableDoctors } from '@/components/admin/available-doctor';
import { RecentAppointments } from '@/components/admin/recent-appointment';
import { StatCard } from '@/components/admin/stat-card';
import { AppointmentChart } from '@/components/charts/appointment-chart';
import { StatSummary } from '@/components/charts/stat-summary';
import { Button } from '@/components/ui/button';
import type { AdminDashboardClientProps } from '@/types/data-types';
import { trpc } from '@/utils/trpc';

export function AdminDashboardClient({ clinicId }: AdminDashboardClientProps) {
  // Fetch fresh data from tRPC (prefetched on server via HydrationBoundary)
  const { data: stats } = useQuery(trpc.admin.getDashboardStats.queryOptions());

  const { data: availableDoctors } = useQuery(
    trpc.admin.getAvailableDoctors.queryOptions({
      clinicId,
      day: new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()
    })
  );

  const { data: appointmentStatus } = useQuery({
    ...trpc.admin.getAppointmentStatus.queryOptions({ clinicId, days: 30 }),
    enabled: !!clinicId
  });

  // Transform appointmentStatus for the chart with safe access
  const chartData = (() => {
    if (!appointmentStatus || !('breakdown' in appointmentStatus)) return [];

    return (appointmentStatus.breakdown as { status: string; count: number }[]).map(item => ({
      name: item.status as string,
      appointment: item.count,
      completed: item.status === 'COMPLETED' ? item.count : 0
    }));
  })();

  const {
    totalPatients = 0,
    totalDoctors = 0,
    todayAppointments = 0,
    completedAppointments = 0,
    upcomingAppointments = 0,
    cancelledAppointments = 0
  } = stats || {};

  const cardData = [
    {
      title: 'Patients',
      value: totalPatients,
      icon: Users,
      className: 'bg-blue-600/15',
      iconClassName: 'bg-blue-600/25 text-blue-600',
      note: 'Total patients',
      link: '/dashboard/patients'
    },
    {
      title: 'Doctors',
      value: totalDoctors,
      icon: User,
      className: 'bg-rose-600/15',
      iconClassName: 'bg-rose-600/25 text-rose-600',
      note: 'Total doctors',
      link: '/dashboard/doctors'
    },
    {
      title: 'Appointments',
      value: todayAppointments,
      icon: BriefcaseBusiness,
      className: 'bg-yellow-600/15',
      iconClassName: 'bg-yellow-600/25 text-yellow-600',
      note: "Today's appointments",
      link: '/dashboard/appointments'
    },
    {
      title: 'Completed',
      value: completedAppointments,
      icon: BriefcaseMedical,
      className: 'bg-emerald-600/15',
      iconClassName: 'bg-emerald-600/25 text-emerald-600',
      note: 'Total completed',
      link: '/dashboard/appointments'
    }
  ];

  const appointmentCounts = {
    SCHEDULED: upcomingAppointments,
    COMPLETED: completedAppointments,
    CANCELLED: cancelledAppointments
  };

  return (
    <div className='flex flex-col gap-6 rounded-xl px-3 py-6 xl:flex-row'>
      {/* LEFT */}
      <div className='w-full xl:w-[69%]'>
        <div className='mb-8 rounded-xl bg-white p-4'>
          <div className='mb-4 flex items-center justify-between'>
            <h1 className='font-semibold text-lg'>Statistics</h1>
            <Button
              size='sm'
              variant='outline'
            >
              {new Date().getFullYear()}
            </Button>
          </div>

          <div className='flex w-full flex-wrap gap-5'>
            {cardData?.map(el => (
              <StatCard
                className={el.className}
                icon={el.icon}
                iconClassName={el.iconClassName}
                key={el.title}
                link={el.link}
                note={el.note}
                title={el.title}
                value={el.value}
              />
            ))}
          </div>
        </div>

        <div className='h-125'>
          <AppointmentChart data={chartData} />
        </div>

        <div className='mt-8 rounded-xl bg-white p-4'>
          <RecentAppointments data={stats?.recentAppointments ?? []} />
        </div>
      </div>

      {/* RIGHT */}
      <div className='w-full xl:w-[30%]'>
        <div className='h-112.5 w-full'>
          <StatSummary
            data={appointmentCounts}
            total={todayAppointments}
          />
        </div>

        <AvailableDoctors data={availableDoctors || []} />
      </div>
    </div>
  );
}
