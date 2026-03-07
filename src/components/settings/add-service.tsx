'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { trpc } from '@/utils/trpc';

import { ServiceCreateSchema } from '../../zodSchemas';
import { CustomInput } from '../custom-input';
import { Button } from '../ui/button';
import { CardDescription, CardHeader } from '../ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Form } from '../ui/form';

const CATEGORIES = [
  { label: 'Consultation', value: 'CONSULTATION' },
  { label: 'Diagnostic', value: 'DIAGNOSIS' },
  { label: 'Treatment', value: 'PROCEDURE' },
  { label: 'Vaccination', value: 'VACCINATION' },
  { label: 'Lab Test', value: 'LAB_TEST' },
  { label: 'Pharmacy', value: 'PHARMACY' },
  { label: 'Other', value: 'OTHER' }
];

type FormValues = z.infer<typeof ServiceCreateSchema>;

interface AddServiceProps {
  clinicId: string;
  initialData: FormValues;
  onSuccessAction?: () => void;
  onErrorAction?: () => void;
}
export const AddService = ({ clinicId, initialData, onSuccessAction, onErrorAction }: AddServiceProps) => {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(initialData);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(ServiceCreateSchema),
    defaultValues: {
      duration: initialData?.duration ?? 30,
      serviceName: initialData?.serviceName || '',
      description: initialData?.description || '',
      price: initialData?.price ?? 0,
      category: 'CONSULTATION',
      clinicId
    }
  });
  const addServiceMutation = useMutation(
    trpc.service.create.mutationOptions({
      onSuccess: () => {
        toast.success(isEditing ? 'Service updated successfully!' : 'Service added successfully!');
        queryClient.invalidateQueries({
          queryKey: [['service', 'getServices']]
        });
        form.reset();
        setOpen(false);
        onSuccessAction?.();
        router.refresh();
      },
      onError: error => {
        toast.error(error.message || 'Error occurred');
        onErrorAction?.();
      }
    })
  );

  const handleOnSubmit = (values: FormValues) => {
    addServiceMutation.mutate(values);
  };

  return (
    <Dialog
      onOpenChange={setOpen}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          className='font-normal text-sm'
          size='sm'
        >
          <Plus
            className='text-gray-500'
            size={22}
          />{' '}
          Add New Service
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CardHeader className='px-0'>
          <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <CardDescription>Fill in the service details.</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit(handleOnSubmit)}
          >
            <CustomInput<FormValues>
              control={form.control}
              label='Service Name'
              name='serviceName'
              placeholder='Enter service name'
              type='input'
            />

            <CustomInput<FormValues>
              control={form.control}
              inputType='number'
              label='Service Price'
              name='price'
              placeholder='0.00'
              type='input'
            />

            <CustomInput<FormValues>
              control={form.control}
              label='Category'
              name='category'
              placeholder='Select category'
              selectList={CATEGORIES}
              type='select'
            />

            <CustomInput<FormValues>
              control={form.control}
              inputType='number'
              label='Duration (minutes)'
              name='duration'
              placeholder='30'
              type='input'
            />

            <CustomInput<FormValues>
              control={form.control}
              label='Service Description'
              name='description'
              placeholder='Enter description'
              type='textarea'
            />

            <Button
              className='w-full bg-blue-600'
              disabled={addServiceMutation.isPending}
              type='submit'
            >
              {addServiceMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
