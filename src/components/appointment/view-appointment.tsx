// components/appointments/view-appointment.tsx

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Phone } from 'lucide-react';

import type { AppointmentStatus } from '@/db/types';
import { getSession } from '@/lib/auth-server';
import { createCaller, getQueryClient, prefetch, trpc } from '@/trpc/server';
import { calculateAge } from '@/utils';

import { ProfileImage } from '../profile-image';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AppointmentAction } from './appointment-action';
import { AppointmentStatusIndicator } from './appointment-status-indicator';

interface ViewAppointmentProps {
  id: string | undefined;
}

// Type for appointment data from the repository - export it so it can be used elsewhere
export type AppointmentWithRelations = {
  id: string;
  appointmentDate: Date;
  time: string;
  status: AppointmentStatus;
  note?: string | null;
  reason?: string | null;
  createdAt: Date;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    image?: string | null;
    address?: string | null;
    phone?: string | null;
    colorCode?: string | null;
  } | null;
  doctor: {
    id: string;
    name: string;
    specialty?: string | null;
    img?: string | null;
    colorCode?: string | null;
  } | null;
  service: {
    id: string;
    serviceName: string;
    price: number;
  } | null;
};

export async function ViewAppointment({ id }: ViewAppointmentProps) {
  if (!id) return null;

  const session = await getSession();
  const clinicId = session?.user?.clinic?.id;

  if (!clinicId) return null;

  // Prefetch the appointment data
  await prefetch(trpc.appointment.getById.queryOptions({ id }));

  // Create server caller for direct data access
  const caller = await createCaller();
  const appointment = await caller.appointment.getById({ id });

  if (!appointment) return null;

  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppointmentDialogContent data={appointment as unknown as AppointmentWithRelations} />
    </HydrationBoundary>
  );
}

// Server Component for dialog content
function AppointmentDialogContent({ data }: { data: AppointmentWithRelations }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className='flex items-center justify-center rounded-full bg-blue-500/10 px-1.5 py-1 text-blue-600 text-xs hover:underline md:text-sm'
          variant='outline'
        >
          View
        </Button>
      </DialogTrigger>

      <DialogContent className='max-h-[95%] max-w-[425px] overflow-y-auto p-8 md:max-w-2xl 2xl:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Patient Appointment</DialogTitle>
          <DialogDescription>
            This appointment was booked on {format(new Date(data.createdAt), 'MMM dd, yyyy')}
          </DialogDescription>
        </DialogHeader>

        {data.status === 'CANCELLED' && (
          <div className='mt-4 rounded-md bg-yellow-100 p-4'>
            <span className='font-semibold text-sm'>This appointment has been cancelled</span>
            <p className='text-sm'>
              <strong>Reason</strong>: {data.reason}
            </p>
          </div>
        )}

        <div className='grid gap-4 py-4'>
          <p className='w-fit rounded bg-blue-100 py-1 text-blue-600 text-xs md:text-sm'>Personal Information</p>

          <div className='mb-16 flex flex-col gap-6 md:flex-row'>
            <div className='flex w-full gap-1 md:w-1/2'>
              <ProfileImage
                className='size-20 bg-blue-500'
                name={data.patient ? `${data.patient.firstName} ${data.patient.lastName}` : 'Patient'}
                textClassName='text-2xl'
                url={data.patient?.image || ''}
              />

              <div className='space-y-0.5'>
                <h2 className='font-semibold text-lg uppercase md:text-xl'>
                  {data.patient ? `${data.patient.firstName} ${data.patient.lastName}` : 'Unknown Patient'}
                </h2>

                <p className='flex items-center gap-2 text-gray-600'>
                  <Calendar
                    className='text-gray-500'
                    size={20}
                  />
                  {calculateAge(data.patient?.dateOfBirth || new Date())}
                </p>

                <span className='flex items-center gap-2 text-sm'>
                  <Phone
                    className='text-gray-500'
                    size={16}
                  />
                  {data.patient?.phone}
                </span>
              </div>
            </div>

            <div>
              <span className='text-gray-500 text-sm'>Address</span>
              <p className='text-gray-600 capitalize'>{data.patient?.address}</p>
            </div>
          </div>

          <p className='w-fit rounded bg-blue-100 py-1 text-blue-600 text-xs md:text-sm'>Appointment Information</p>

          <div className='grid grid-cols-3 gap-10'>
            <div>
              <span className='text-gray-500 text-sm'>Date</span>
              <p className='text-gray-600 text-sm'>{format(new Date(data.appointmentDate), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <span className='text-gray-500 text-sm'>Time</span>
              <p>{data.time}</p>
            </div>
            <div>
              <span className='text-gray-500 text-sm'>Status</span>
              <AppointmentStatusIndicator status={data.status} />
            </div>
          </div>

          {data.note && (
            <div>
              <span className='text-gray-500 text-sm'>Note from Patient</span>
              <p>{data.note}</p>
            </div>
          )}

          <p className='mt-16 w-fit rounded bg-blue-100 px-2 py-1 text-blue-600 text-xs md:text-sm'>
            Physician Information
          </p>

          <div className='mb-8 flex w-full flex-col gap-8 md:flex-row'>
            <div className='flex gap-3'>
              <ProfileImage
                className='size-20 bg-emerald-600'
                name={data.doctor?.name || 'Doctor'}
                textClassName='text-2xl'
                url={data.doctor?.img || ''}
              />
              <div>
                <h2 className='font-medium text-lg uppercase'>{data.doctor?.name}</h2>
                <p className='flex items-center gap-2 text-gray-600 capitalize'>{data.doctor?.specialty}</p>
              </div>
            </div>
          </div>

          <p className='mt-4 w-fit rounded bg-blue-100 px-2 py-1 text-blue-600 text-xs md:text-sm'>Perform Action</p>

          <AppointmentAction
            id={data.id}
            status={data.status}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
