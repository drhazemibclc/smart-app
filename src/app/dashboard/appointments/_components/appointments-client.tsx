// apps/web/src/app/(dashboard)/appointments/components/appointments-client.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, List } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Appointment, AppointmentStatus } from '@/db/types';
import { trpc } from '@/utils/trpc';

import { AppointmentCalendar } from './appointment-calendar';
import { AppointmentCard } from './appointment-card';
import { AppointmentFilters } from './appointment-filters';
import { AppointmentStatsCards } from './stats-card';

export function AppointmentsClient() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AppointmentStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch appointments with filters
  const { data, isLoading, refetch } = useQuery(
    trpc.appointment.list.queryOptions({
      clinic: '00000000-0000-0000-0000-000000000000', // Placeholder UUID, should come from session
      updatedAt: new Date(),
      page,
      limit: pageSize,
      status: status !== 'all' ? [status] : undefined,
      startDate: view === 'calendar' ? undefined : selectedDate,
      endDate: view === 'calendar' ? undefined : selectedDate
    })
  );

  const { data: todayAppointments, refetch: refetchToday } = useQuery(trpc.appointment.today.queryOptions());

  const { data: stats, refetch: refetchStats } = useQuery(trpc.appointment.stats.queryOptions({ period: 'month' }));

  const appointments = Array.isArray(data?.items) ? data.items : [];
  const todayList = Array.isArray(todayAppointments) ? todayAppointments : [];

  const filteredAppointments = appointments.filter((app: Appointment) =>
    `${app.patient?.firstName ?? ''} ${app.patient?.lastName ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  // Mutation for status updates
  const updateStatus = useMutation(
    trpc.appointment.updateStatus.mutationOptions({
      onSuccess: () => {
        toast.success('Appointment updated successfully');
        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: ['appointment'] });
        refetch();
        refetchToday();
        refetchStats();
      },
      onError: (error: { message: string }) => {
        toast.error(error.message || 'Failed to update appointment');
      }
    })
  );

  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    updateStatus.mutate({ id: appointmentId, status: newStatus });
  };

  return (
    <DashboardLayout>
      <div className='p-4 md:p-8'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='font-bold text-3xl'>Appointments</h1>
            <p className='text-muted-foreground'>Manage and schedule patient appointments</p>
          </div>
          <Button asChild>
            <a href='/appointments/new'>New Appointment</a>
          </Button>
        </div>

        {/* Stats Cards */}
        <AppointmentStatsCards
          stats={stats}
          todayCount={todayList.length}
          todayList={todayList}
        />

        {/* View Toggle & Filters */}
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Tabs
            onValueChange={(v: string) => setView(v as 'list' | 'calendar')}
            value={view}
          >
            <TabsList>
              <TabsTrigger
                className='flex items-center gap-2'
                value='list'
              >
                <List className='h-4 w-4' />
                List View
              </TabsTrigger>
              <TabsTrigger
                className='flex items-center gap-2'
                value='calendar'
              >
                <Calendar className='h-4 w-4' />
                Calendar View
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <AppointmentFilters
            onDateChange={setSelectedDate}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            search={search}
            selectedDate={selectedDate}
            status={status}
            view={view}
          />
        </div>

        {/* Content */}
        {view === 'calendar' ? (
          <AppointmentCalendar
            appointments={appointments}
            onDateSelect={setSelectedDate}
            onStatusChange={handleStatusChange}
            selectedDate={selectedDate}
          />
        ) : (
          <div className='space-y-4'>
            {isLoading ? (
              <div>Loading...</div>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className='py-8 text-center'>
                  <p className='text-muted-foreground'>No appointments found</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment: Appointment) => (
                <AppointmentCard
                  appointment={appointment}
                  key={appointment.id}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className='flex justify-center gap-2 pt-4'>
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  size='sm'
                  variant='outline'
                >
                  Previous
                </Button>
                <span className='flex items-center px-4 text-sm'>
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  disabled={page === data.totalPages}
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  size='sm'
                  variant='outline'
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
