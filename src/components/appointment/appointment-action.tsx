'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AppointmentStatus } from '@/db/types';

import { trpc } from '../../utils/trpc';

interface ActionProps {
  id: string; // Assuming 'id' is a string (UUID) for Prisma. Adjust if it's a number.
  status: AppointmentStatus; // Type as AppointmentStatus directly
}

export const AppointmentAction = ({ id, status }: ActionProps) => {
  // `localLoading` is for any internal component loading states not directly tied to the mutation.
  // `isMutating` will come directly from the tRPC hook.
  const [localLoading, setLocalLoading] = useState(false);
  const [selected, setSelected] = useState<AppointmentStatus | ''>(''); // 'selected' will hold the new status
  const [reason, setReason] = useState('');
  const router = useRouter();
  // Initialize the tRPC mutation hook
  // `mutate` is the function to call to trigger the mutation
  const { mutate, isPending: isMutating } = useMutation(
    trpc.appointment.appointmentAction.mutationOptions({
      onSuccess: data => {
        if (data.message) {
          toast.success(data.message || 'Appointment status updated successfully!');
          router.refresh(); // Refresh the page to show updated status
          setSelected(''); // Reset selected action
          setReason(''); // Reset reason
        } else {
          toast.error(data.message || 'Failed to update appointment status.');
        }
      },
      onError: error => {
        console.error('TRPC Error updating appointment status:', error);
        toast.error(error.message || 'Something went wrong. Please try again.');
      },
      // `onSettled` is good for common cleanup, regardless of success or error.
      // We'll use this to manage our `localLoading` state.
      onSettled: () => {
        setLocalLoading(false); // End local loading
      }
    })
  );

  const handleAction = async () => {
    if (isMutating || localLoading || !selected) {
      return;
    }

    setLocalLoading(true);

    const newReason = reason || `Appointment has been ${selected.toLowerCase()} on ${new Date().toLocaleDateString()}`;

    try {
      // Use await with mutateAsync to resolve the warning and handle timing
      await mutate({
        id,
        status: selected,
        reason: newReason
      });

      // This code only runs AFTER the mutation succeeds
      console.log('Success!');
    } catch (error) {
      // Handle errors here
      console.error('Failed:', error);
    } finally {
      setLocalLoading(false);
    }
  };
  // Determine if a status button should be disabled
  const isDisabled = (buttonStatus: AppointmentStatus) => {
    // Combine local loading and tRPC mutation loading
    const anyLoading = localLoading || isMutating;
    return (
      anyLoading ||
      status === 'COMPLETED' || // If current status is COMPLETED, disable all other actions.
      status === buttonStatus // Disable button if its status already matches current appointment status
    );
  };

  return (
    <div>
      <div className='flex items-center space-x-3'>
        <Button
          className='bg-yellow-200 text-black'
          disabled={isDisabled('PENDING')}
          onClick={() => setSelected('PENDING')}
          variant='outline'
        >
          Pending
        </Button>
        <Button
          className='bg-blue-200 text-black'
          disabled={isDisabled('SCHEDULED')}
          onClick={() => setSelected('SCHEDULED')}
          variant='outline'
        >
          Approve
        </Button>
        <Button
          className='bg-emerald-200 text-black'
          disabled={isDisabled('COMPLETED')}
          onClick={() => setSelected('COMPLETED')}
          variant='outline'
        >
          Completed
        </Button>
        <Button
          className='bg-red-200 text-black'
          disabled={isDisabled('CANCELLED')}
          onClick={() => setSelected('CANCELLED')}
          variant='outline'
        >
          Cancel
        </Button>
      </div>
      {/* Show reason textarea only if 'CANCELLED' is selected */}
      {selected === 'CANCELLED' && (
        <Textarea
          className='mt-4'
          disabled={localLoading || isMutating}
          onChange={e => setReason(e.target.value)}
          placeholder='Enter reason...'
          value={reason} // Controlled component
        />
      )}

      {/* Show confirmation only if an action is selected */}
      {selected && (
        <div className='mt-6 flex items-center justify-between rounded bg-red-100 p-4'>
          <p className=''>Are you sure you want to perform this action?</p>
          <Button
            disabled={localLoading || isMutating}
            onClick={handleAction}
            type='button'
          >
            Yes
          </Button>
        </div>
      )}
    </div>
  );
};
