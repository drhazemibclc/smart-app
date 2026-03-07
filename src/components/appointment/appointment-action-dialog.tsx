// components/ui/appointment-action-dialog.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, Check, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { AppointmentStatus } from '@/db/types';
import { cn } from '@/lib/utils';

import { trpc } from '../../utils/trpc';
import { Button } from '../ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';

// Status labels
const statusLabels: Record<AppointmentStatus, { label: string; color: string }> = {
  CHECKED_IN: {
    label: 'Checked In',
    color: 'text-gray-600 border-gray-600'
  },
  SCHEDULED: {
    label: 'Scheduled',
    color: 'text-blue-600 border-blue-600'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-600 border-red-600'
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-emerald-600 border-emerald-600'
  },
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-600 border-yellow-600'
  },
  NO_SHOW: {
    label: 'No Show',
    color: 'text-orange-600 border-orange-600'
  }
};

interface ActionsProps {
  type: 'approve' | 'cancel';
  id: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export const AppointmentActionDialog = ({ type, id, disabled = false, onSuccess }: ActionsProps) => {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: updateStatus, isPending } = useMutation(
    trpc.appointment.updateStatus.mutationOptions({
      onSuccess: (data: { success: boolean; message: string }) => {
        toast.success(data.message);
        setReason('');
        setOpen(false);
        onSuccess?.();

        // Invalidate queries
        queryClient.invalidateQueries(trpc.appointment.getDoctorAppointments.queryFilter());
        queryClient.invalidateQueries(trpc.appointment.getById.queryFilter({ id }));
      },
      onError: err => {
        toast.error(err.message || 'Failed to update appointment');
      }
    })
  );

  const handleAction = () => {
    if (type === 'cancel' && !reason.trim()) {
      toast.error('Please provide a reason for cancellation.');
      return;
    }

    const status = type === 'approve' ? 'SCHEDULED' : 'CANCELLED';
    const actionReason =
      reason.trim() ||
      `Appointment has been ${type === 'approve' ? 'scheduled' : 'cancelled'} on ${new Date().toLocaleDateString()}`;

    updateStatus({
      id,
      status: status as AppointmentStatus,
      reason: actionReason
    });
  };

  return (
    <Dialog
      onOpenChange={setOpen}
      open={open}
    >
      <DialogTrigger asChild>
        {type === 'approve' ? (
          <Button
            className='w-full justify-start gap-2'
            disabled={disabled}
            size='sm'
            variant='ghost'
          >
            <Check className='h-4 w-4' />
            <span>Approve</span>
          </Button>
        ) : (
          <Button
            className='flex w-full items-center justify-start gap-2 text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={disabled}
            size='sm'
            variant='outline'
          >
            <Ban className='h-4 w-4' />
            <span>Cancel</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <div className='flex flex-col items-center justify-center py-6'>
          {/* Icon */}
          <DialogTitle className='mb-4'>
            {type === 'approve' ? (
              <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100'>
                <CheckCircle2 className='h-8 w-8 text-emerald-600' />
              </div>
            ) : (
              <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
                <XCircle className='h-8 w-8 text-red-600' />
              </div>
            )}
          </DialogTitle>

          {/* Title */}
          <h3 className='mb-2 font-semibold text-gray-900 text-lg'>
            Appointment {type === 'approve' ? 'Confirmation' : 'Cancellation'}
          </h3>

          {/* Description */}
          <p className='mb-6 text-center text-gray-600 text-sm'>
            {type === 'approve'
              ? "You're about to confirm this appointment. Click 'Confirm' to approve or 'Cancel' to go back."
              : 'Are you sure you want to cancel this appointment? Please provide a reason below.'}
          </p>

          {/* Reason input for cancellation */}
          {type === 'cancel' && (
            <div className='mb-6 w-full'>
              <label
                className='mb-2 block text-left font-medium text-gray-700 text-sm'
                htmlFor='reason'
              >
                Cancellation Reason
              </label>
              <Textarea
                className='min-h-[100px] w-full'
                disabled={isPending}
                id='reason'
                onChange={e => setReason(e.target.value)}
                placeholder='Please provide a reason for cancellation...'
                value={reason}
              />
              <p className='mt-1 text-left text-gray-500 text-xs'>
                This reason will be recorded in the appointment history.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className='mt-4 flex w-full items-center justify-center gap-3'>
            <Button
              className={cn(
                'flex-1 font-medium',
                type === 'approve'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              )}
              disabled={isPending || (type === 'cancel' && !reason.trim())}
              onClick={handleAction}
              type='button'
            >
              {isPending ? (
                <span className='flex items-center gap-2'>
                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Processing...
                </span>
              ) : type === 'approve' ? (
                'Confirm Appointment'
              ) : (
                'Cancel Appointment'
              )}
            </Button>

            <DialogClose asChild>
              <Button
                className='flex-1'
                disabled={isPending}
                type='button'
                variant='outline'
              >
                Go Back
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface AppointmentStatusUpdateProps {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  allowedStatuses?: AppointmentStatus[];
  onUpdate?: (newStatus: AppointmentStatus) => void;
}

export const AppointmentStatusUpdate = ({
  appointmentId,
  currentStatus,
  allowedStatuses = ['SCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
  onUpdate
}: AppointmentStatusUpdateProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(currentStatus);

  const queryClient = useQueryClient();

  const { mutate: updateStatus, isPending } = useMutation(
    trpc.appointment.updateStatus.mutationOptions({
      onSuccess: (data: { message: string }) => {
        toast.success(data.message);
        setReason('');
        setOpen(false);
        onUpdate?.(selectedStatus);

        // Invalidate queries
        queryClient.invalidateQueries(trpc.appointment.getDoctorAppointments.queryFilter());
        queryClient.invalidateQueries(trpc.appointment.getById.queryFilter({ id: appointmentId }));
      },
      onError: error => {
        toast.error(error.message || 'Failed to update appointment');
      }
    })
  );

  const handleStatusUpdate = () => {
    if (selectedStatus === 'CANCELLED' && !reason.trim()) {
      toast.error('Please provide a reason for cancellation.');
      return;
    }

    const actionReason =
      reason.trim() || `Appointment status updated to ${selectedStatus} on ${new Date().toLocaleDateString()}`;

    updateStatus({
      id: appointmentId,
      status: selectedStatus,
      reason: actionReason
    });
  };

  return (
    <Dialog
      onOpenChange={setOpen}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          size='sm'
          variant='outline'
        >
          Update Status
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-lg'>
        <DialogTitle className='mb-4'>Update Appointment Status</DialogTitle>

        <div className='space-y-6'>
          {/* Status Selection */}
          <div>
            <label
              className='mb-2 block font-medium text-gray-700 text-sm'
              htmlFor=''
            >
              Select New Status
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {allowedStatuses.map(status => (
                <button
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border p-3 font-medium text-sm transition-colors',
                    selectedStatus === status
                      ? `${statusLabels[status].color} border-current`
                      : 'border-gray-300 hover:bg-gray-50'
                  )}
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  type='button'
                >
                  {statusLabels[status].label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input (for cancellations) */}
          {selectedStatus === 'CANCELLED' && (
            <div>
              <label
                className='mb-2 block font-medium text-gray-700 text-sm'
                htmlFor='status-update-reason'
              >
                Cancellation Reason
              </label>
              <Textarea
                className='min-h-[100px]'
                disabled={isPending}
                id='status-update-reason'
                onChange={e => setReason(e.target.value)}
                placeholder='Please provide a reason...'
                value={reason}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-3'>
            <Button
              disabled={isPending}
              onClick={() => setOpen(false)}
              type='button'
              variant='outline'
            >
              Cancel
            </Button>
            <Button
              className={cn(
                selectedStatus === 'CANCELLED' && 'bg-red-600 hover:bg-red-700',
                selectedStatus === 'COMPLETED' && 'bg-emerald-600 hover:bg-emerald-700'
              )}
              disabled={isPending || (selectedStatus === 'CANCELLED' && !reason.trim())}
              onClick={handleStatusUpdate}
              type='button'
            >
              {isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
