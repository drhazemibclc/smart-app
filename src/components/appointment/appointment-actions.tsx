import { EllipsisVertical, User } from 'lucide-react';
import Link from 'next/link';

import { checkRole, getUser } from '@/lib/auth-server';

import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { AppointmentActionDialog } from './appointment-action-dialog';

interface ActionsProps {
  userId: string;
  status: string | null;
  patientId: string | null;
  doctorId: string | null;
  appointmentId: string;
}

export const AppointmentActionOptions = async ({ patientId, doctorId, status, appointmentId }: ActionsProps) => {
  const user = await getUser();
  const isAdmin = await checkRole('admin');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className='flex items-center justify-center rounded-full p-1'
          variant='outline'
        >
          <EllipsisVertical
            className='text-gray-500 text-sm'
            size={16}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-56 p-3'>
        <div className='flex flex-col items-start space-y-3'>
          <span className='text-gray-400 text-xs'>Perform Actions</span>
          <Button
            asChild
            className='w-full justify-start'
            size='sm'
            variant='ghost'
          >
            <Link href={`appointments/${appointmentId}`}>
              <User size={16} /> View Full Details
            </Link>
          </Button>

          {status !== 'SCHEDULED' && (
            <AppointmentActionDialog
              disabled={isAdmin || user?.id === doctorId}
              id={appointmentId}
              type='approve'
            />
          )}
          <AppointmentActionDialog
            disabled={status === 'PENDING' && (isAdmin || user?.id === doctorId || user?.id === patientId)}
            id={appointmentId}
            type='cancel'
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
