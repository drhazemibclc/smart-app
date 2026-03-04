// apps/web/src/app/(dashboard)/appointments/components/appointment-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';

// Validation schema
const appointmentSchema = z.object({
  patientId: z.string().uuid('Please select a patient'),
  clinicId: z.string().uuid('Clinic ID is required'),
  doctorId: z.string().uuid('Please select a doctor'),
  serviceId: z.string().uuid('Please select a service').optional(),
  appointmentDate: z.date({
    error: 'Please select a date'
  }),
  time: z.string({
    error: 'Please select a time'
  }),
  type: z.enum([
    'CONSULTATION',
    'VACCINATION',
    'PROCEDURE',
    'EMERGENCY',
    'CHECKUP',
    'FOLLOW_UP',
    'FEEDING_SESSION',
    'OTHER'
  ]),
  duration: z.number(),
  appointmentPrice: z.number().optional(),
  notes: z.string().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  appointmentId?: string;
  initialData?: Partial<AppointmentFormValues>;
}

export function AppointmentForm({ initialData, appointmentId }: AppointmentFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!appointmentId;

  // Get session data for clinicId
  const [session] = useState(() => {
    // This would ideally come from a context or auth hook
    return { user: { clinic: { id: '00000000-0000-0000-0000-000000000000' } } }; // Placeholder UUID
  });

  const { data: doctors } = useQuery(
    trpc.doctor.list.queryOptions({ clinicId: session?.user?.clinic?.id || '', limit: 100 })
  );

  const { data: patients } = useQuery(
    trpc.patient.list.queryOptions({ clinicId: session?.user?.clinic?.id || '', limit: 100 })
  );

  const { data: services } = useQuery(trpc.service.list.queryOptions({ clinicId: session?.user?.clinic?.id || '' }));

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: 'CONSULTATION',
      clinicId: session?.user?.clinic?.id,
      duration: 30,
      ...initialData
    }
  });

  const selectedDoctorId = form.watch('doctorId');
  const selectedDate = form.watch('appointmentDate');

  // Fetch available time slots when doctor and date are selected
  const { data: availableSlots, isLoading: slotsLoading } = useQuery({
    ...trpc.appointment.availableSlots.queryOptions({
      doctorId: selectedDoctorId,
      date: selectedDate || new Date(),
      duration: form.watch('duration') || 30
    }),
    enabled: !!(selectedDoctorId && selectedDate)
  });

  const createMutation = useMutation(
    trpc.appointment.create.mutationOptions({
      onSuccess: () => {
        toast.success('Appointment created successfully');
        queryClient.invalidateQueries({ queryKey: ['appointment'] });
        router.push('/appointments');
      },
      onError: (error: { message: string }) => {
        toast.error(error.message || 'Failed to create appointment');
      }
    })
  );

  const updateMutation = useMutation(
    trpc.appointment.update.mutationOptions({
      onSuccess: () => {
        toast.success('Appointment updated successfully');
        queryClient.invalidateQueries({ queryKey: ['appointment'] });
        router.push('/appointments');
      },
      onError: (error: { message: string }) => {
        toast.error(error.message || 'Failed to update appointment');
      }
    })
  );

  const onSubmit = (values: AppointmentFormValues) => {
    if (isEditing && appointmentId) {
      updateMutation.mutate({ id: appointmentId, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Patient Selection */}
          <FormField
            control={form.control}
            name='patientId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select patient' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients?.items?.map(patient => (
                      <SelectItem
                        key={patient.id}
                        value={patient.id}
                      >
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Doctor Selection */}
          <FormField
            control={form.control}
            name='doctorId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor *</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select doctor' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors?.items?.map(doctor => (
                      <SelectItem
                        key={doctor.id}
                        value={doctor.id}
                      >
                        Dr. {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Selection */}
          <FormField
            control={form.control}
            name='appointmentDate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        variant='outline'
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    align='start'
                    className='w-auto p-0'
                  >
                    <Calendar
                      disabled={date => date < new Date()}
                      initialFocus
                      mode='single'
                      onSelect={field.onChange}
                      selected={field.value}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time Selection */}
          <FormField
            control={form.control}
            name='time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time *</FormLabel>
                <Select
                  defaultValue={field.value}
                  disabled={!(selectedDoctorId && selectedDate) || slotsLoading}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={slotsLoading ? 'Loading available times...' : 'Select time'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(availableSlots) &&
                      availableSlots.map(slot => (
                        <SelectItem
                          disabled={!slot.available}
                          key={slot.value}
                          value={slot.value}
                        >
                          {slot.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {!selectedDoctorId && 'Select a doctor first'}
                  {selectedDoctorId && !selectedDate && 'Select a date first'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Service Selection */}
          <FormField
            control={form.control}
            name='serviceId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select service (optional)' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(services) &&
                      services.map(service => (
                        <SelectItem
                          key={service.id}
                          value={service.id}
                        >
                          {service.serviceName} - ${service.price}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Appointment Type */}
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='CONSULTATION'>Consultation</SelectItem>
                    <SelectItem value='VACCINATION'>Vaccination</SelectItem>
                    <SelectItem value='PROCEDURE'>Procedure</SelectItem>
                    <SelectItem value='EMERGENCY'>Emergency</SelectItem>
                    <SelectItem value='CHECKUP'>Checkup</SelectItem>
                    <SelectItem value='FOLLOW_UP'>Follow Up</SelectItem>
                    <SelectItem value='FEEDING_SESSION'>Feeding Session</SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <FormField
            control={form.control}
            name='duration'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <Select
                  defaultValue={field.value?.toString()}
                  onValueChange={v => field.onChange(Number.parseInt(v, 10))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select duration' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='15'>15 minutes</SelectItem>
                    <SelectItem value='30'>30 minutes</SelectItem>
                    <SelectItem value='45'>45 minutes</SelectItem>
                    <SelectItem value='60'>60 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem className='md:col-span-2'>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Any special notes or instructions'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            onClick={() => router.back()}
            type='button'
            variant='outline'
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            type='submit'
          >
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEditing ? 'Update' : 'Create'} Appointment
          </Button>
        </div>
      </form>
    </Form>
  );
}
