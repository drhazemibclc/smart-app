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
import type { AdminDashboardStats } from '@/server/db/services/admin.service';
import type { AppointmentsChartProps } from '@/types/data-types';
import { trpc } from '@/utils/trpc';

interface AvailableDoctor {
  id: string;
  name: string;
  specialty: string;
  img: string | null;
  colorCode: string | null;
  workingDays: { day: string; startTime: string; endTime: string }[];
  appointmentCount: number;
}

interface AdminDashboardClientProps {
  clinicId: string;
  initialData: {
    dashboardStats: AdminDashboardStats;
    availableDoctors: AvailableDoctor[];
  };
}

export function AdminDashboardClient({ clinicId, initialData }: AdminDashboardClientProps) {
  // Use initialData for instant hydration, then tRPC keeps it fresh
  const { data: stats } = useQuery({
    ...trpc.admin.getDashboardStats.queryOptions(),
    initialData: initialData.dashboardStats
  });

  const { data: availableDoctors } = useQuery({
    ...trpc.admin.getAvailableDoctors.queryOptions({
      clinicId,
      day: new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()
    }),
    initialData: initialData.availableDoctors
  });

  const { data: appointmentStatus } = useQuery(trpc.admin.getAppointmentStatus.queryOptions({ clinicId, days: 30 }));

  // Transform appointmentStatus for the chart
  const chartData: AppointmentsChartProps =
    (
      appointmentStatus as { total: number; breakdown: { status: string; count: number }[] } | undefined
    )?.breakdown?.map(item => ({
      name: item.status,
      appointment: item.count,
      completed: item.status === 'COMPLETED' ? item.count : 0
    })) ?? [];

  const {
    totalPatients,
    totalDoctors,
    todayAppointments,
    completedAppointments,
    upcomingAppointments,
    cancelledAppointments
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
      value: completedAppointments || 0,
      icon: BriefcaseMedical,
      className: 'bg-emerald-600/15',
      iconClassName: 'bg-emerald-600/25 text-emerald-600',
      note: 'Total completed',
      link: '/dashboard/appointments'
    }
  ];

  const appointmentCounts = {
    SCHEDULED: upcomingAppointments || 0,
    COMPLETED: completedAppointments || 0,
    CANCELLED: cancelledAppointments || 0
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
            total={todayAppointments || 0}
          />
        </div>

        <AvailableDoctors data={availableDoctors || []} />
      </div>
    </div>
  );
}
