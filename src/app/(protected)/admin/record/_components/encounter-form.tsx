'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';
import { type CompleteEncounterInput, CompleteEncounterSchema } from '@/zodSchemas';

const ENCOUNTER_TYPES = [
  { label: 'Consultation', value: 'CONSULTATION' },
  { label: 'Vaccination', value: 'VACCINATION' },
  { label: 'Screening', value: 'SCREENING' },
  { label: 'Follow-up', value: 'FOLLOW_UP' },
  { label: 'Nutrition', value: 'NUTRITION' },
  { label: 'Newborn', value: 'NEWBORN' },
  { label: 'Lactation', value: 'LACTATION' },
  { label: 'Other', value: 'OTHER' }
];

interface EncounterFormProps {
  appointmentId?: string;
  patientId?: string;
  onSuccess?: () => void;
}

export function EncounterForm({ appointmentId, patientId, onSuccess }: EncounterFormProps) {
  const router = useRouter();
  const [showVitals, setShowVitals] = useState(false);

  // Fetch patients and doctors
  const { data: patients } = useQuery(trpc.patient.list.queryOptions({ limit: 100 }));
  const { data: doctors } = useQuery(trpc.doctor.list.queryOptions({ limit: 100 }));

  const form = useForm({
    resolver: zodResolver(CompleteEncounterSchema),
    defaultValues: {
      patientId: patientId || '',
      doctorId: '',
      appointmentId: appointmentId || '',
      clinicId: '', // This should be populated from session/context
      encounterType: 'CONSULTATION',
      encounterStatus: 'PENDING',
      encounterDate: new Date(),
      symptoms: '',
      diagnosis: '',
      treatment: '',
      followUpPlan: '',
      notes: '',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      vitals: {
        bodyTemperature: undefined,
        systolic: undefined,
        diastolic: undefined,
        heartRate: undefined,
        respiratoryRate: undefined,
        oxygenSaturation: undefined,
        notes: ''
      }
    }
  });

  const createEncounterMutation = useMutation({
    mutationFn: async (data: CompleteEncounterInput) => {
      // This would call your server action
      const response = await fetch('/api/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create encounter');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Encounter created successfully');
      form.reset();
      onSuccess?.();
      router.refresh();
    },
    onError: error => {
      toast.error(error.message || 'Failed to create encounter');
    }
  });

  const onSubmit = (data: CompleteEncounterInput) => {
    createEncounterMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Patient & Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Encounter Information</CardTitle>
            <CardDescription>Basic encounter details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='patientId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select
                      disabled={!!patientId}
                      onValueChange={field.onChange}
                      value={field.value}
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

              <FormField
                control={form.control}
                name='doctorId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
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
                            {doctor.name} - {doctor.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='encounterType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Encounter Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENCOUNTER_TYPES.map(type => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='encounterDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Encounter Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            variant='outline'
                          >
                            {field.value ? format(field.value as Date, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        align='start'
                        className='w-auto p-0'
                      >
                        <Calendar
                          initialFocus
                          mode='single'
                          onSelect={date => field.onChange(date)}
                          selected={field.value as Date}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chief Complaint & Clinical Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Assessment</CardTitle>
            <CardDescription>Document the patient's condition and treatment</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='symptoms'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint / Symptoms</FormLabel>
                  <FormControl>
                    <Textarea
                      className='min-h-[100px]'
                      placeholder="Describe the patient's symptoms..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='diagnosis'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea
                      className='min-h-[80px]'
                      placeholder='Enter diagnosis...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='treatment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Plan</FormLabel>
                  <FormControl>
                    <Textarea
                      className='min-h-[80px]'
                      placeholder='Describe treatment plan...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='followUpPlan'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Plan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Follow-up instructions...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Any additional notes...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Vital Signs (Optional) */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Vital Signs</CardTitle>
                <CardDescription>Record patient vital signs (optional)</CardDescription>
              </div>
              <Button
                onClick={() => setShowVitals(!showVitals)}
                size='sm'
                type='button'
                variant='outline'
              >
                {showVitals ? 'Hide' : 'Show'} Vitals
              </Button>
            </div>
          </CardHeader>
          {showVitals && (
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='vitals.bodyTemperature'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='36.5'
                          step='0.1'
                          type='number'
                          {...field}
                          onChange={e => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='vitals.systolic'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systolic (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='120'
                          type='number'
                          {...field}
                          onChange={e =>
                            field.onChange(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='vitals.diastolic'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diastolic (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='80'
                          type='number'
                          {...field}
                          onChange={e =>
                            field.onChange(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='vitals.heartRate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heart Rate (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='72'
                          type='number'
                          {...field}
                          onChange={e =>
                            field.onChange(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='vitals.respiratoryRate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Respiratory Rate</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='16'
                          type='number'
                          {...field}
                          onChange={e =>
                            field.onChange(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='vitals.oxygenSaturation'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O2 Saturation (%)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='98'
                          type='number'
                          {...field}
                          onChange={e =>
                            field.onChange(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='vitals.notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vitals Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Notes about vital signs...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* SOAP Notes (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>SOAP Notes (Optional)</CardTitle>
            <CardDescription>Structured clinical documentation</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='subjective'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjective</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Patient's description of symptoms..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='objective'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Observable findings...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='assessment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Clinical assessment...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='plan'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Treatment plan...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Submit Button */}
        <div className='flex justify-end gap-4'>
          <Button
            onClick={() => router.back()}
            type='button'
            variant='outline'
          >
            Cancel
          </Button>
          <Button
            disabled={createEncounterMutation.isPending}
            type='submit'
          >
            {createEncounterMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Create Encounter
          </Button>
        </div>
      </form>
    </Form>
  );
}
