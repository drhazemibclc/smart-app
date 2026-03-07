'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/utils/trpc';
import { CreateNewDoctorInputSchema } from '@/zodSchemas/doctor.schema';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export type DoctorFormValues = z.input<typeof CreateNewDoctorInputSchema>;

interface NewDoctorFormProps {
  clinicId: string;
}

export function NewDoctorForm({ clinicId }: NewDoctorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Inside NewDoctorForm component
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(CreateNewDoctorInputSchema),
    defaultValues: {
      clinicId,
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      specialty: '',
      address: '',
      department: '',
      type: 'FULL',
      appointmentPrice: 0,
      isActive: true,
      availableFromTime: '09:00',
      availableToTime: '17:00',
      availableFromWeekDay: 2,
      availableToWeekDay: 10,
      password: '',
      workSchedule: [],
      img: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // Ensure this matches the key in CreateNewDoctorInputSchema
    name: 'workSchedule'
  });

  const createMutation = useMutation(
    trpc.admin.createNewDoctor.mutationOptions({
      onSuccess: () => {
        toast.success('Doctor created successfully');
        queryClient.invalidateQueries({
          queryKey: ['doctor']
        });
        router.push('/dashboard/doctors');
        router.refresh();
      },
      onError: error => {
        return toast.error(error.message || 'Failed to create doctor');
      }
    })
  );

  const onSubmit = (values: DoctorFormValues) => {
    createMutation.mutate({
      ...values,
      clinicId
    });
  };

  const addWorkingDay = () => {
    append({
      day: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00'
    });
  };

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='grid gap-6 sm:grid-cols-2'>
          <div>
            <Label htmlFor='name'>Full Name *</Label>
            <Input
              className='mt-2'
              id='name'
              placeholder='Dr. John Doe'
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor='email'>Email *</Label>
            <Input
              className='mt-2'
              id='email'
              placeholder='john@example.com'
              type='email'
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor='department'>Department *</Label>
            <Input
              className='mt-2'
              id='department'
              placeholder='General'
              {...form.register('department')}
            />
            {form.formState.errors.department && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.department.message}</p>
            )}
          </div>
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <div>
            <Label htmlFor='address'>Address *</Label>
            <Input
              className='mt-2'
              id='address'
              placeholder='123 Main St'
              {...form.register('address')}
            />
            {form.formState.errors.address && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.address.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor='type'>Type *</Label>
            <Select
              onValueChange={(value: 'FULL' | 'PART') => form.setValue('type', value, { shouldValidate: true })}
              value={form.watch('type')}
            >
              <SelectTrigger
                className='mt-2'
                id='type'
              >
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='FULL'>Full Time</SelectItem>
                <SelectItem value='PART'>Part Time</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.type.message}</p>
            )}
          </div>
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <div>
            <Label htmlFor='phone'>Phone *</Label>
            <Input
              className='mt-2'
              id='phone'
              placeholder='+1234567890'
              {...form.register('phone')}
            />
            {form.formState.errors.phone && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor='licenseNumber'>License Number *</Label>
            <Input
              className='mt-2'
              id='licenseNumber'
              placeholder='LIC-12345'
              {...form.register('licenseNumber')}
            />
            {form.formState.errors.licenseNumber && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.licenseNumber.message}</p>
            )}
          </div>
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <div>
            <Label htmlFor='specialty'>Specialty *</Label>
            <Input
              className='mt-2'
              id='specialty'
              placeholder='Cardiology'
              {...form.register('specialty')}
            />
            {form.formState.errors.specialty && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.specialty.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor='appointmentPrice'>Appointment Price ($) *</Label>
            <Input
              className='mt-2'
              id='appointmentPrice'
              min={0}
              step='0.01'
              type='number'
              {...form.register('appointmentPrice', { valueAsNumber: true })}
            />
            {form.formState.errors.appointmentPrice && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.appointmentPrice.message}</p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Switch
            checked={form.watch('isActive')}
            id='isActive'
            onCheckedChange={checked => form.setValue('isActive', checked)}
          />
          <Label htmlFor='isActive'>Active (available for appointments)</Label>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Label>Working Days *</Label>
            <Button
              onClick={addWorkingDay}
              size='sm'
              type='button'
              variant='outline'
            >
              Add Working Day
            </Button>
          </div>

          {fields.map((field, index) => {
            // Get errors for this specific working day entry
            const dayError = form.getFieldState(`workSchedule.${index}.day`, form.formState).error;
            const startTimeError = form.getFieldState(`workSchedule.${index}.startTime`, form.formState).error;
            const endTimeError = form.getFieldState(`workSchedule.${index}.endTime`, form.formState).error;

            return (
              <div
                className='grid gap-4 rounded-lg border p-4 sm:grid-cols-4'
                key={field.id}
              >
                <div>
                  <Label htmlFor={`workSchedule.${index}.day`}>Day</Label>
                  <Select
                    onValueChange={(value: (typeof DAYS_OF_WEEK)[number]) =>
                      form.setValue(`workSchedule.${index}.day`, value, { shouldValidate: true })
                    }
                    value={form.watch(`workSchedule.${index}.day`)}
                  >
                    <SelectTrigger
                      className='mt-2'
                      id={`workSchedule.${index}.day`}
                    >
                      <SelectValue placeholder='Select day' />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem
                          key={day}
                          value={day}
                        >
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {dayError && <p className='mt-1 text-destructive text-sm'>{dayError.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`workSchedule.${index}.startTime`}>Start Time</Label>
                  <Input
                    className='mt-2'
                    id={`workSchedule.${index}.startTime`}
                    placeholder='09:00'
                    type='time'
                    {...form.register(`workSchedule.${index}.startTime`)}
                  />
                  {startTimeError && <p className='mt-1 text-destructive text-sm'>{startTimeError.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`workSchedule.${index}.endTime`}>End Time</Label>
                  <Input
                    className='mt-2'
                    id={`workSchedule.${index}.endTime`}
                    placeholder='17:00'
                    type='time'
                    {...form.register(`workSchedule.${index}.endTime`)}
                  />
                  {endTimeError && <p className='mt-1 text-destructive text-sm'>{endTimeError.message}</p>}
                </div>
                <div className='flex items-end'>
                  <Button
                    className='w-full'
                    onClick={() => remove(index)}
                    type='button'
                    variant='destructive'
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}

          {form.formState.errors.workSchedule &&
            !Array.isArray(form.formState.errors.workSchedule) &&
            'message' in form.formState.errors.workSchedule && (
              <p className='text-destructive text-sm'>{form.formState.errors.workSchedule.message}</p>
            )}
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            disabled={createMutation.isPending}
            onClick={() => router.back()}
            type='button'
            variant='outline'
          >
            Cancel
          </Button>
          <LoadingButton
            loading={createMutation.isPending}
            type='submit'
          >
            Create Doctor
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
