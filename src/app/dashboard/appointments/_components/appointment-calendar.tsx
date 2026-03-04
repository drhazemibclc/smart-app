// apps/web/src/app/(dashboard)/appointments/components/appointment-calendar.tsx
'use client';

import { format, isSameDay, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/prisma/types';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  selectedDate: Date;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-500',
  CHECKED_IN: 'bg-purple-500',
  IN_PROGRESS: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-gray-500'
};

export function AppointmentCalendar({ appointments, selectedDate, onDateSelect }: AppointmentCalendarProps) {
  // Group appointments by date for calendar dots
  const appointmentsByDate = appointments.reduce(
    (acc, app) => {
      const dateKey = format(new Date(app.appointmentDate), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(app);
      return acc;
    },
    {} as Record<string, unknown[]>
  );

  // Filter appointments for selected date
  const dayAppointments = appointments
    .filter(app => isSameDay(new Date(app.appointmentDate), selectedDate))
    .sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });

  return (
    <div className='grid gap-6 lg:grid-cols-[350px_1fr]'>
      {/* Calendar sidebar */}
      <Card>
        <CardContent className='p-4'>
          <Calendar
            className='rounded-md border'
            mode='single'
            modifiers={{
              hasAppointments: (date: string | number | Date) => {
                const dateKey = format(date, 'yyyy-MM-dd');
                return !!appointmentsByDate[dateKey];
              }
            }}
            modifiersClassNames={{
              hasAppointments:
                'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary'
            }}
            onSelect={(date: Date) => date && onDateSelect(date)}
            required
            selected={selectedDate}
          />

          <div className='mt-4 space-y-2'>
            <h4 className='font-medium text-sm'>Legend</h4>
            {Object.entries(statusColors).map(([status, color]) => (
              <div
                className='flex items-center gap-2 text-xs'
                key={status}
              >
                <div className={cn('h-3 w-3 rounded-full', color)} />
                <span>{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day view */}
      <Card>
        <CardContent className='p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h2 className='font-semibold text-lg'>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
              {isToday(selectedDate) && (
                <Badge
                  className='mt-1'
                  variant='secondary'
                >
                  Today
                </Badge>
              )}
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  onDateSelect(newDate);
                }}
                size='icon'
                variant='outline'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                onClick={() => onDateSelect(new Date())}
                size='icon'
                variant='outline'
              >
                <CalendarIcon className='h-4 w-4' />
              </Button>
              <Button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  onDateSelect(newDate);
                }}
                size='icon'
                variant='outline'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className='space-y-2'>
            {dayAppointments.length === 0 ? (
              <p className='py-8 text-center text-muted-foreground'>No appointments scheduled for this day</p>
            ) : (
              Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                const hourAppointments = dayAppointments.filter(app => {
                  const appHour = (app.time || '00:00').split(':')[0];
                  return appHour === hour;
                });

                return (
                  <div
                    className='flex gap-4'
                    key={hour}
                  >
                    <div className='w-16 text-right text-muted-foreground text-sm'>{hour}:00</div>
                    <div className='flex-1 space-y-2'>
                      {hourAppointments.map(app => (
                        <div
                          className={cn(
                            'rounded-lg p-3',
                            app.status && `${statusColors[app.status]?.replace('bg-', 'bg-')}/10`,
                            'border-l-4',
                            app.status &&
                              statusColors[app.status] &&
                              `border-l-${statusColors[app.status].replace('bg-', '')}`
                          )}
                          key={app.id}
                        >
                          <div className='flex items-center justify-between'>
                            <div>
                              <span className='font-medium'>Patient ID: {app.patientId.slice(0, 8)}</span>
                              <span className='ml-2 text-muted-foreground text-sm'>{app.time}</span>
                            </div>
                            <Badge
                              className={cn(
                                app.status && statusColors[app.status] && `${statusColors[app.status]} text-white`
                              )}
                              variant='outline'
                            >
                              {app.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className='mt-1 text-muted-foreground text-sm'>
                            Doctor ID: {app.doctorId.slice(0, 8)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
