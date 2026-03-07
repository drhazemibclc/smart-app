'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/trpc/query-client';

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

const doctorFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  appointmentPrice: z.string().min(1, 'Price is required'),
  workSchedule: z
    .array(
      z.object({
        day: z.enum(DAYS_OF_WEEK),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
      })
    )
    .min(1, 'Select at least one working day')
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface Doctor {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialty: string;
  appointmentPrice: number;
  workSchedule?: Array<{
    day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
    startTime: string;
    endTime: string;
  }>;
}

interface EditDoctorFormProps {
  doctor: Doctor;
  doctorId: string;
}

export function EditDoctorForm({ doctor, doctorId }: EditDoctorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      licenseNumber: doctor.licenseNumber,
      specialty: doctor.specialty,
      appointmentPrice: doctor.appointmentPrice.toString(),
      workSchedule: (doctor.workSchedule || []) as Array<{
        day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
        startTime: string;
        endTime: string;
      }>
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'workSchedule'
  });

  const updateMutation = useMutation(
    trpc.doctor.update.mutationOptions({
      onSuccess: () => {
        toast.success('Doctor updated successfully');
        queryClient.invalidateQueries({ queryKey: ['doctor'] });
        router.push(`/dashboard/doctors/${doctorId}`);
        router.refresh();
      },
      onError: error => {
        toast.error(error.message || 'Failed to update doctor');
      }
    })
  );

  const onSubmit = (values: DoctorFormValues) => {
    updateMutation.mutate({
      id: doctorId,
      clinicId: doctor.clinicId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      licenseNumber: values.licenseNumber,
      specialty: values.specialty,
      appointmentPrice: values.appointmentPrice,
      workSchedule: values.workSchedule
    });
  };

  const addWorkingDay = () => {
    append({
      day: 'monday',
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
              placeholder='100'
              type='text'
              {...form.register('appointmentPrice')}
            />
            {form.formState.errors.appointmentPrice && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.appointmentPrice.message}</p>
            )}
          </div>
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

          {fields.map((field, index) => (
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem
                        key={day}
                        value={day}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          ))}

          {form.formState.errors.workSchedule && (
            <p className='text-destructive text-sm'>{form.formState.errors.workSchedule.message}</p>
          )}
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            disabled={updateMutation.isPending}
            onClick={() => router.back()}
            type='button'
            variant='outline'
          >
            Cancel
          </Button>
          <LoadingButton
            loading={updateMutation.isPending}
            type='submit'
          >
            Update Doctor
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
