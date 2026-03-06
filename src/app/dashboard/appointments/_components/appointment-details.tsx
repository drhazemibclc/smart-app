// apps/web/src/app/(dashboard)/appointments/components/appointment-details.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import type Decimal from 'decimal.js';
import { ArrowLeft, Calendar, Clock, Edit, Mail, MapPin, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { Appointment, AppointmentStatus, AppointmentType } from '@/db/types';
import { cn } from '@/lib/utils';
import { toNumber } from '@/utils/decimal';
import { trpc } from '@/utils/trpc';

// Following guide: Properly typed status colors with Record - all statuses included
const statusColors: Record<AppointmentStatus, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-500', text: 'text-white' },
  SCHEDULED: { bg: 'bg-blue-500', text: 'text-white' },
  CHECKED_IN: { bg: 'bg-purple-500', text: 'text-white' },
  COMPLETED: { bg: 'bg-green-700', text: 'text-white' },
  CANCELLED: { bg: 'bg-red-500', text: 'text-white' },
  NO_SHOW: { bg: 'bg-gray-500', text: 'text-white' }
} as const;

interface AppointmentDetailsProps {
  id: string;
  status?: AppointmentStatus;
  patientId?: string;
  doctorId?: string;
  clinicId?: string;
  serviceId?: string;
  appointmentDate?: Date;
  time?: string;
  duration?: number;
  type?: AppointmentType;
  appointmentPrice?: Decimal;
  notes?: string;
}

export function AppointmentDetails({ id }: AppointmentDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch appointment data
  const appointmentQuery = useQuery(trpc.appointment.getById.queryOptions({ id }));
  const appointment = appointmentQuery.data;
  const isLoading = appointmentQuery.isLoading;

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async (variables: { id: string; status: AppointmentStatus }) => {
      const response = await fetch('/api/trpc/appointment.updateStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(variables)
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Appointment updated successfully');
      void queryClient.invalidateQueries({
        queryKey: trpc.appointment.getById.queryKey({ id })
      });
      void queryClient.refetchQueries({
        queryKey: trpc.appointment.getById.queryKey({ id })
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update appointment';
      toast.error(message);
    }
  });

  // Loading state
  if (isLoading) {
    return <AppointmentDetailsSkeleton />;
  }

  // Not found state
  if (!appointment) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <p className='text-muted-foreground'>Appointment not found</p>
            <Button
              className='mt-4'
              onClick={() => router.push('/dashboard/appointments')}
              variant='outline'
            >
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe destructuring with fallbacks
  const data = appointment as unknown as Appointment;
  const patient = data.patient;
  const doctor = data.doctor;
  const service = data.service;
  const appointmentDate = new Date(data.appointmentDate);
  const date = format(appointmentDate, 'EEEE, MMMM d, yyyy');
  const time = data.time || format(appointmentDate, 'h:mm a');
  const statusStyle = statusColors[data.status as keyof typeof statusColors] || statusColors.SCHEDULED;

  return (
    <div className='container mx-auto max-w-4xl py-8'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            aria-label='Go back'
            onClick={() => router.back()}
            size='icon'
            variant='ghost'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='font-bold text-2xl'>Appointment Details</h1>
            <p className='text-muted-foreground'>ID: {data.id?.slice(0, 8) ?? ''}...</p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            asChild
            size='sm'
            variant='outline'
          >
            <Link href={`/appointments/${id}/edit`}>
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </Link>
          </Button>
          <Badge className={cn(statusStyle.bg, statusStyle.text)}>
            {data.status?.replace('_', ' ') ?? 'Scheduled'}
          </Badge>
        </div>
      </div>

      {/* Grid layout for cards */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Patient Info Card */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <User className='h-4 w-4' />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='py-2 font-medium'>Name</TableCell>
                  <TableCell className='py-2'>
                    <Link
                      className='font-medium text-primary hover:underline'
                      href={`/patients/${patient?.id}`}
                    >
                      {patient?.firstName} {patient?.lastName}
                    </Link>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className='py-2 font-medium'>Date of Birth</TableCell>
                  <TableCell className='py-2'>
                    {patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMMM d, yyyy') : 'N/A'}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className='py-2 font-medium'>Gender</TableCell>
                  <TableCell className='py-2'>{patient?.gender || 'N/A'}</TableCell>
                </TableRow>

                {patient?.phone && (
                  <TableRow>
                    <TableCell className='py-2 font-medium'>Phone</TableCell>
                    <TableCell className='py-2'>
                      <a
                        className='flex items-center gap-2 text-primary hover:underline'
                        href={`tel:${patient.phone}`}
                      >
                        <Phone className='h-3 w-3' />
                        {patient.phone}
                      </a>
                    </TableCell>
                  </TableRow>
                )}

                {patient?.email && (
                  <TableRow>
                    <TableCell className='py-2 font-medium'>Email</TableCell>
                    <TableCell className='py-2'>
                      <a
                        className='flex items-center gap-2 text-primary hover:underline'
                        href={`mailto:${patient.email}`}
                      >
                        <Mail className='h-3 w-3' />
                        {patient.email}
                      </a>
                    </TableCell>
                  </TableRow>
                )}

                {patient?.address && (
                  <TableRow>
                    <TableCell className='py-2 font-medium'>Address</TableCell>
                    <TableCell className='py-2'>
                      <div className='flex items-start gap-2'>
                        <MapPin className='mt-1 h-3 w-3 shrink-0' />
                        <span>{patient.address}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Appointment Info Card */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Calendar className='h-4 w-4' />
              Appointment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='py-2 font-medium'>Date</TableCell>
                  <TableCell className='py-2'>{date}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className='py-2 font-medium'>Time</TableCell>
                  <TableCell className='py-2'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-3 w-3' />
                      {time}
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className='py-2 font-medium'>Duration</TableCell>
                  <TableCell className='py-2'>{data.duration || 30} minutes</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className='py-2 font-medium'>Type</TableCell>
                  <TableCell className='py-2'>{data.type?.replace('_', ' ') || 'In Person'}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className='py-2 font-medium'>Status</TableCell>
                  <TableCell className='py-2'>
                    <Badge
                      className={cn(statusStyle.bg, statusStyle.text)}
                      variant='outline'
                    >
                      {data.status?.replace('_', ' ') ?? 'N/A'}
                    </Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className='py-2 font-medium'>Price</TableCell>
                  <TableCell className='py-2'>
                    $
                    {data.appointmentPrice
                      ? toNumber(data.appointmentPrice)
                      : service?.price
                        ? toNumber(service.price)
                        : 0}
                  </TableCell>
                </TableRow>

                {data.note && (
                  <TableRow>
                    <TableCell className='py-2 font-medium'>Notes</TableCell>
                    <TableCell className='py-2 text-sm'>{data.note}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Doctor Info Card */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <User className='h-4 w-4' />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className='py-2 font-medium'>Name</TableCell>
                  <TableCell className='py-2'>Dr. {doctor?.name}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className='py-2 font-medium'>Specialty</TableCell>
                  <TableCell className='py-2'>{doctor?.specialty || 'N/A'}</TableCell>
                </TableRow>

                {doctor?.phone && (
                  <TableRow>
                    <TableCell className='py-2 font-medium'>Phone</TableCell>
                    <TableCell className='py-2'>
                      <a
                        className='flex items-center gap-2 text-primary hover:underline'
                        href={`tel:${doctor.phone}`}
                      >
                        <Phone className='h-3 w-3' />
                        {doctor.phone}
                      </a>
                    </TableCell>
                  </TableRow>
                )}

                {doctor?.email && (
                  <TableRow>
                    <TableCell className='py-2 font-medium'>Email</TableCell>
                    <TableCell className='py-2'>
                      <a
                        className='flex items-center gap-2 text-primary hover:underline'
                        href={`mailto:${doctor.email}`}
                      >
                        <Mail className='h-3 w-3' />
                        {doctor.email}
                      </a>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Service Info Card - Conditional */}
        {service && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>Service Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className='py-2 font-medium'>Service</TableCell>
                    <TableCell className='py-2'>{service.serviceName}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className='py-2 font-medium'>Price</TableCell>
                    <TableCell className='py-2'>${toNumber(service.price)}</TableCell>
                  </TableRow>

                  {service.description && (
                    <TableRow>
                      <TableCell className='py-2 font-medium'>Description</TableCell>
                      <TableCell className='py-2 text-sm'>{service.description}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className='my-8' />

      {/* Status-based actions */}
      <div className='flex justify-end gap-3'>
        {data.status === 'SCHEDULED' && (
          <>
            <Button
              className='text-red-600 hover:text-red-700'
              onClick={() => updateStatus.mutate({ id, status: 'CANCELLED' })}
              variant='outline'
            >
              Cancel Appointment
            </Button>
            <Button onClick={() => updateStatus.mutate({ id, status: 'CHECKED_IN' })}>Check In Patient</Button>
          </>
        )}

        {data.status === 'CHECKED_IN' && (
          <Button onClick={() => updateStatus.mutate({ id, status: 'COMPLETED' })}>Complete Visit</Button>
        )}

        {data.status === 'PENDING' && (
          <Button
            onClick={() => updateStatus.mutate({ id, status: 'SCHEDULED' })}
            variant='default'
          >
            Confirm Appointment
          </Button>
        )}

        {data.status === 'NO_SHOW' && (
          <Button
            onClick={() => router.push(`/appointments/new?patientId=${patient?.id}`)}
            variant='outline'
          >
            Reschedule
          </Button>
        )}
      </div>
    </div>
  );
}

// Skeleton loader for better UX
function AppointmentDetailsSkeleton() {
  return (
    <div className='container mx-auto max-w-4xl py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-10 w-10 rounded-md' />
          <div>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='mt-2 h-4 w-32' />
          </div>
        </div>
        <Skeleton className='h-10 w-24' />
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className='pb-3'>
              <Skeleton className='h-5 w-32' />
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {[1, 2, 3].map(j => (
                  <div
                    className='flex justify-between'
                    key={j}
                  >
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='mt-8 flex justify-end'>
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
}
