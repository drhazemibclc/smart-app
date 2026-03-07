'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { UserPenIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Doctor, Patient } from '@/db/types';
import { generateTimes } from '@/utils';

import { trpc } from '../../utils/trpc';
import { AppointmentCreateSchema } from '../../zodSchemas';
import { CustomInput } from '../custom-input';
import { ProfileImage } from '../profile-image';

const TYPES = [
  { label: 'General Consultation', value: 'General Consultation' },
  { label: 'General Check up', value: 'General Check Up' },
  { label: 'Antenatal', value: 'Antenatal' },
  { label: 'Maternity', value: 'Maternity' },
  { label: 'Lab Test', value: 'Lab Test' },
  { label: 'ANT', value: 'ANT' }
];

export const BookAppointment = ({ data, doctors }: { data: Patient; doctors: Doctor[] }) => {
  const [loading, _setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [physicians, _setPhysicians] = useState<Doctor[] | undefined>(doctors);
  // Use tRPC mutation properly
  const createAppointmentMutation = useMutation(
    trpc.appointment.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        setIsOpen(false);
        router.refresh();
        toast.success('Appointment created successfully');
      },
      onError: error => {
        console.error('Appointment creation failed:', error);
        toast.error(error.message || 'Something went wrong. Try again later.');
      }
    })
  );

  const appointmentTimes = generateTimes(8, 17, 30);

  const patientName = `${data?.firstName} ${data?.lastName}`;

  const form = useForm<z.infer<typeof AppointmentCreateSchema>>({
    resolver: zodResolver(AppointmentCreateSchema),
    defaultValues: {
      doctorId: '',
      appointmentDate: new Date(),
      time: '',
      type: 'CHECKUP',
      note: ''
    }
  });

  const onSubmit: SubmitHandler<z.infer<typeof AppointmentCreateSchema>> = async values => {
    try {
      setIsSubmitting(true);

      // Prepare the data with patientId
      const appointmentData = {
        ...values,
        patientId: data?.id ?? '',
        // Add clinicId if required by your schema
        clinicId: data?.clinicId ?? ''
      };

      // Use the mutation
      await createAppointmentMutation.mutateAsync(appointmentData);
    } catch (error) {
      // Error is handled in the mutation onError callback
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when sheet closes
      form.reset();
    }
  };

  return (
    <Sheet
      onOpenChange={handleOpenChange}
      open={isOpen}
    >
      <SheetTrigger asChild>
        <Button
          className='flex w-full items-center justify-start gap-2 bg-blue-600 font-light text-sm text-white'
          variant='ghost'
        >
          <UserPenIcon size={16} /> Book Appointment
        </Button>
      </SheetTrigger>

      <SheetContent className='w-full rounded-xl rounded-r-2xl md:top-[2.5%] md:right-[1%] md:h-[95%]'>
        {loading ? (
          <div className='flex h-full items-center justify-center'>
            <span>Loading</span>
          </div>
        ) : (
          <div className='h-full overflow-y-auto p-4'>
            <SheetHeader>
              <SheetTitle>Book Appointment</SheetTitle>
            </SheetHeader>

            <Form {...form}>
              <form
                className='mt-5 space-y-8 2xl:mt-10'
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className='flex w-full items-center gap-4 rounded-md border border-input bg-background px-3 py-1'>
                  <ProfileImage
                    bgColor={data?.colorCode ?? '#000000'}
                    className='size-16 border border-input'
                    name={patientName}
                    textClassName='text-sm font-medium'
                    url={data?.image ?? ''}
                  />

                  <div>
                    <p className='font-semibold text-lg'>{patientName}</p>
                    <span className='text-gray-500 text-sm capitalize'>{data?.gender}</span>
                  </div>
                </div>

                <CustomInput
                  control={form.control}
                  label='Appointment Type'
                  name='type'
                  placeholder='Select a appointment type'
                  selectList={TYPES}
                  type='select'
                />

                <FormField
                  control={form.control}
                  name='doctorId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physician</FormLabel>
                      <Select
                        defaultValue={field.value}
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a physician' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {physicians?.map(doctor => (
                            <SelectItem
                              key={doctor.id}
                              value={doctor.id ?? ''}
                            >
                              <div className='flex flex-row items-center gap-2 p-2'>
                                <ProfileImage
                                  bgColor={doctor?.colorCode ?? '#000000'}
                                  className='size-10'
                                  name={doctor?.name}
                                  textClassName='text-xs'
                                  url={doctor?.img ?? ''}
                                />
                                <div className='flex flex-col'>
                                  <p className='text-start font-medium'>{doctor.name}</p>
                                  <span className='text-gray-600 text-sm'>{doctor?.specialty}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex items-center gap-2'>
                  <CustomInput
                    control={form.control}
                    inputType='date'
                    label='Date'
                    name='appointmentDate'
                    placeholder=''
                    type='input'
                  />
                  <CustomInput
                    control={form.control}
                    label='Time'
                    name='time'
                    placeholder='Select time'
                    selectList={appointmentTimes}
                    type='select'
                  />
                </div>

                <CustomInput
                  control={form.control}
                  label='Additional Note'
                  name='note'
                  placeholder='Additional note'
                  type='textarea'
                />

                <Button
                  className='w-full bg-blue-600'
                  disabled={isSubmitting || createAppointmentMutation.isPending}
                  type='submit'
                >
                  {createAppointmentMutation.isPending ? 'Creating...' : 'Submit'}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
