import { format } from 'date-fns';
import type Decimal from 'decimal.js';
import Link from 'next/link';

import type { AppointmentStatus } from '@/db/types';

import { AppointmentStatusIndicator } from '../appointment/appointment-status-indicator';
import { ViewAppointment } from '../appointment/view-appointment';
import { ProfileImage } from '../profile-image';
import { Button } from '../ui/button';
import { Table } from './table';

export interface Appointment {
  id: string;
  patientId?: string | null;
  doctorId?: string;
  serviceId?: string | null;
  doctorSpecialty?: string | null;
  appointmentDate: Date;
  appointmentPrice?: Decimal | null;
  time: string | null;
  status: AppointmentStatus | null;
  type?: string | null;
  note?: string | null;
  reason?: string | null;
  clinicId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  isDeleted?: boolean | null;
  // Optional populated fields
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    gender?: string | null;
    colorCode?: string | null;
    image?: string | null;
  } | null;
  doctor?: {
    name: string;
    specialty?: string | null;
    colorCode?: string | null;
    img?: string | null;
  } | null;
}

interface DataProps {
  data: Appointment[];
}
const columns = [
  { header: 'Info', key: 'patient' }, // matches Appointment.patient
  { header: 'Date', key: 'appointmentDate', className: 'hidden md:table-cell' },
  { header: 'Time', key: 'time', className: 'hidden md:table-cell' },
  { header: 'Doctor', key: 'doctor', className: 'hidden md:table-cell' },
  { header: 'Status', key: 'status', className: 'hidden xl:table-cell' },
  { header: 'Actions', key: 'id' } // use id to identify the row for actions
] as const;

export const RecentAppointments = ({ data }: DataProps) => {
  const renderRow = (item: Appointment) => {
    const name = item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : 'Unknown Patient';
    return (
      <tr
        className='border-gray-200 border-b text-sm even:bg-slate-50 hover:bg-slate-50'
        key={item?.id}
      >
        <td className='flex items-center gap-2 py-2 xl:py-4 2xl:gap-4'>
          <ProfileImage
            bgColor={item?.patient?.colorCode ?? ''}
            className='bg-violet-600'
            name={name}
            url={item?.patient?.image ?? ''}
          />
          <div>
            <h3 className='text-sm uppercase md:font-medium md:text-base'>{name}</h3>
            <span className='text-xs capitalize'>{item?.patient?.gender?.toLowerCase()}</span>
          </div>
        </td>

        <td className='hidden md:table-cell'>{format(item?.appointmentDate, 'yyyy-MM-dd')}</td>
        <td className='hidden md:table-cell'>{item?.time}</td>
        <td className='hidden items-center py-2 md:table-cell'>
          <div className='flex items-center 2x:gap-4 gap-2'>
            <ProfileImage
              bgColor={item?.doctor?.colorCode ?? ''}
              className='bg-blue-600'
              name={item?.doctor?.name ?? ''}
              textClassName='text-black font-medium'
              url={item?.doctor?.img ?? ''}
            />
            <div>
              <h3 className='font-medium uppercase'>{item?.doctor?.name}</h3>
              <span className='text-xs capitalize'>{item?.doctor?.specialty}</span>
            </div>
          </div>
        </td>

        <td className='hidden xl:table-cell'>
          <AppointmentStatusIndicator status={item?.status ?? 'CANCELLED'} />
        </td>

        <td>
          <div className='flex items-center gap-x-2'>
            <ViewAppointment id={item?.id} />

            <Link href={`/record/appointments/${item?.id}`}>See all</Link>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className='rounded-xl bg-white p-2 2xl:p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='font-semibold text-lg'>Recent Appointments</h1>

        <Button
          asChild
          variant={'outline'}
        >
          <Link href='/record/appointments'>View All</Link>
        </Button>
      </div>

      <Table
        columns={columns}
        data={data}
        renderRow={renderRow}
      />
    </div>
  );
};
