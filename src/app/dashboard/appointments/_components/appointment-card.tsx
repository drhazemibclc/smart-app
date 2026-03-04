// apps/web/src/app/dashboard/appointments/_components/appointment-card.tsx
'use client';

import { format } from 'date-fns';
import { Calendar, CheckCircle2, Clock, MoreVertical, User, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Appointment, AppointmentStatus } from '@/db/types';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}

const statusColors: Record<AppointmentStatus, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  CHECKED_IN: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' }
};

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const patientName = appointment.patient
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
    : 'Unknown Patient';

  const doctorName = appointment.doctor?.name || 'Unknown Doctor';
  const time = appointment.time || format(new Date(appointment.appointmentDate), 'HH:mm');
  const date = format(new Date(appointment.appointmentDate), 'MMM dd, yyyy');

  const statusStyle = appointment.status ? statusColors[appointment.status] : statusColors.SCHEDULED;

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(appointment.id ?? '', newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', isUpdating && 'pointer-events-none opacity-50')}>
      <CardContent className='p-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          {/* Left section - Patient & Doctor info */}
          <div className='flex items-start gap-4'>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', statusStyle.bg)}>
              <User className={cn('h-6 w-6', statusStyle.text)} />
            </div>

            <div>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold text-lg'>
                  <Link
                    className='hover:underline'
                    href={`/dashboard/patients/${appointment.patientId}`}
                  >
                    {patientName}
                  </Link>
                </h3>
                <Badge
                  className={cn(statusStyle.bg, statusStyle.text)}
                  variant='outline'
                >
                  <span className={cn('mr-1 inline-block h-2 w-2 rounded-full', statusStyle.dot)} />
                  {appointment.status?.replace('_', ' ')}
                </Badge>
              </div>

              <div className='mt-1 flex flex-wrap items-center gap-4 text-muted-foreground text-sm'>
                <div className='flex items-center gap-1'>
                  <Calendar className='h-4 w-4' />
                  <span>{date}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  <span>{time}</span>
                </div>
                <div>Dr. {doctorName}</div>
                {appointment.service && <Badge variant='secondary'>{appointment.service.serviceName}</Badge>}
              </div>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className='flex items-center gap-2'>
            {/* Status-specific actions */}
            {appointment.status === 'SCHEDULED' && (
              <Button
                onClick={() => handleStatusChange('CHECKED_IN')}
                size='sm'
                variant='outline'
              >
                Check In
              </Button>
            )}

            {appointment.status === 'CHECKED_IN' && (
              <Button
                onClick={() => handleStatusChange('PENDING')}
                size='sm'
              >
                Start Visit
              </Button>
            )}

            {appointment.status === 'PENDING' && (
              <Button
                onClick={() => handleStatusChange('COMPLETED')}
                size='sm'
                variant='default'
              >
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Complete
              </Button>
            )}

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                >
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem asChild>
                  <Link href={`/appointments/${appointment.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/appointments/${appointment.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                {appointment.status !== 'CANCELLED' && appointment.status !== 'NO_SHOW' && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange('CANCELLED')}>
                      <XCircle className='mr-2 h-4 w-4 text-red-500' />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('NO_SHOW')}>Mark No Show</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
