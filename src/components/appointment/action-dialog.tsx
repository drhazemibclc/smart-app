'use client';

import { useMutation } from '@tanstack/react-query';
import { HelpCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { trpc } from '../../utils/trpc';
import { ProfileImage } from '../profile-image';
import { SmallCard } from '../ui/small-card';

interface ActionDialogProps {
  type: 'doctor' | 'staff' | 'delete';
  id: string;
  data?: {
    img?: string | null;
    name?: string | null;
    colorCode?: string | null;
    role?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    department?: string | null;
    licenseNumber?: string | null;
  };
  deleteType?: 'doctor' | 'staff' | 'patient' | 'payment' | 'bill';
}

export const ActionDialog = ({ id, data, type, deleteType }: ActionDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // CORRECTED: Use trpc.useMutation to call the server-side procedure.
  // The `trpc` object is the client-side instance created by tRPC.
  const deleteMutation = useMutation(
    trpc.admin.deleteDataById.mutationOptions({
      onSuccess: () => {
        toast.success('Record deleted successfully');
        setOpen(false);
        router.refresh();
      },
      onError: error => {
        console.error('Failed to delete record:', error);
        toast.error('Failed to delete record');
      }
    })
  );

  const handleDelete = () => {
    if (!deleteType) {
      toast.error('Delete type is not specified');
      return;
    }

    // Call the mutate function from the hook with the required parameters.
    deleteMutation.mutate({ id, deleteType });
  };

  if (type === 'delete') {
    return (
      <Dialog
        onOpenChange={setOpen}
        open={open}
      >
        <DialogTrigger asChild>
          <Button
            className='flex items-center justify-center rounded-full text-red-500'
            variant={'outline'}
          >
            <Trash2
              className='text-red-500'
              size={16}
            />
            {deleteType === 'patient' && 'Delete'}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <div className='flex flex-col items-center justify-center py-6'>
            <DialogTitle>
              <div className='mb-2 rounded-full bg-red-200 p-4'>
                <HelpCircle
                  className='text-red-500'
                  size={50}
                />
              </div>
            </DialogTitle>

            <span className='text-black text-xl'>Delete Confirmation</span>
            <p className='text-sm'>Are you sure you want to delete the selected record?</p>

            <div className='mt-6 flex items-center justify-center gap-x-3'>
              <DialogClose asChild>
                <Button
                  className='px-4 py-2'
                  variant={'outline'}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                className='bg-destructive px-4 py-2 font-medium text-sm text-white hover:bg-destructive hover:text-white'
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                variant='outline'
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes. Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (type === 'staff') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className='flex items-center justify-center rounded-full text-blue-600 hover:underline'
            variant={'outline'}
          >
            View
          </Button>
        </DialogTrigger>

        <DialogContent className='max-h-[90%] max-w-75 overflow-y-auto p-8 md:max-w-2xl'>
          <DialogTitle className='mb-4 font-semibold text-gray-600 text-lg'>Staff Information</DialogTitle>

          <div className='flex justify-between'>
            <div className='flex items-center gap-3'>
              <ProfileImage
                bgColor={data?.colorCode ?? '0000'}
                className='xl:size-20'
                name={data?.name ?? ''}
                textClassName='xl:text-2xl'
                url={data?.img ?? ''}
              />

              <div className='flex flex-col'>
                <p className='font-semibold text-xl'>{data?.name}</p>
                <span className='text-gray-600 text-sm capitalize md:text-base'>{data?.role?.toLowerCase()}</span>
                <span className='text-blue-500 text-sm'>Full-Time</span>
              </div>
            </div>
          </div>

          <div className='mt-10 space-y-6'>
            <div className='flex flex-col gap-y-4 md:flex-row md:flex-wrap md:items-center md:gap-x-0 xl:justify-between'>
              <SmallCard
                label='Email Address'
                value={data?.email ?? 'N/A'}
              />
              <SmallCard
                label='Phone Number'
                value={data?.phone ?? 'N/A'}
              />
            </div>

            <div>
              <SmallCard
                label='Address'
                value={data?.address || 'N/A'}
              />
            </div>

            <div className='flex flex-col gap-y-4 md:flex-row md:flex-wrap md:items-center md:gap-x-0 xl:justify-between'>
              <SmallCard
                label='Role'
                value={data?.role ?? 'N/A'}
              />
              <SmallCard
                label='Department'
                value={data?.department || 'N/A'}
              />
              <SmallCard
                label='License Number'
                value={data?.licenseNumber || 'N/A'}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return null;
};
