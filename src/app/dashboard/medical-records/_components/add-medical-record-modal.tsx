'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const medicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().optional(),
  appointmentId: z.string().optional(),

  // SOAP Format
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),

  // Traditional fields
  diagnosis: z.string().optional(),
  symptoms: z.string().optional(),
  treatmentPlan: z.string().optional(),
  notes: z.string().optional(),

  // Vitals
  vitals: z
    .object({
      bodyTemperature: z.number().optional(),
      heartRate: z.number().optional(),
      respiratoryRate: z.number().optional(),
      oxygenSaturation: z.number().optional(),
      systolic: z.number().optional(),
      diastolic: z.number().optional(),
      weight: z.number().optional(),
      height: z.number().optional(),
      bmi: z.number().optional()
    })
    .optional(),

  followUpDate: z.date().optional(),
  isConfidential: z.boolean(),
  accessLevel: z.enum(['STANDARD', 'SENSITIVE', 'RESTRICTED']),

  labRequest: z.string().optional(),
  attachments: z.string().optional()
});

type MedicalRecordForm = z.infer<typeof medicalRecordSchema>;

interface AddMedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Array<{ id: string; firstName: string; lastName: string; dateOfBirth: string }>;
  doctors: Array<{ id: string; name: string; specialty: string | null }>;
  clinicId: string;
  userId: string;
  onSuccess: () => void;
}

export function AddMedicalRecordModal({
  open,
  onOpenChange,
  patients,
  clinicId,
  userId,
  onSuccess
}: AddMedicalRecordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('soap');

  const form = useForm<MedicalRecordForm>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: '',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      diagnosis: '',
      symptoms: '',
      treatmentPlan: '',
      notes: '',
      vitals: {},
      isConfidential: false,
      accessLevel: 'STANDARD'
    }
  });

  const onSubmit = async (values: MedicalRecordForm) => {
    setIsLoading(true);

    try {
      // Calculate BMI if weight and height are provided
      if (values.vitals?.weight && values.vitals?.height) {
        const heightInM = values.vitals.height / 100;
        values.vitals.bmi = values.vitals.weight / (heightInM * heightInM);
      }

      const response = await fetch('/api/trpc/medical.createMedicalRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          clinicId,
          doctorId: userId,
          createdAt: new Date()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create medical record');
      }

      toast.success('Medical record created successfully');
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create medical record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={open}
    >
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create Medical Record</DialogTitle>
          <DialogDescription>Enter the patient's medical information and clinical notes</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Tabs
              className='space-y-4'
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger value='patient'>Patient</TabsTrigger>
                <TabsTrigger value='soap'>SOAP Notes</TabsTrigger>
                <TabsTrigger value='vitals'>Vitals</TabsTrigger>
                <TabsTrigger value='diagnosis'>Diagnosis</TabsTrigger>
                <TabsTrigger value='settings'>Settings</TabsTrigger>
              </TabsList>

              <TabsContent
                className='space-y-4'
                value='patient'
              >
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
                          {patients.map(patient => (
                            <SelectItem
                              key={patient.id}
                              value={patient.id}
                            >
                              {patient.lastName}, {patient.firstName}
                              {patient.dateOfBirth && ` (${format(new Date(patient.dateOfBirth), 'yyyy')})`}
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
                  name='followUpDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Follow-up Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
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
              </TabsContent>

              <TabsContent
                className='space-y-4'
                value='soap'
              >
                <FormField
                  control={form.control}
                  name='subjective'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjective (S)</FormLabel>
                      <FormControl>
                        <Textarea
                          className='min-h-[100px]'
                          placeholder="Patient's complaints, symptoms, history of present illness..."
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
                      <FormLabel>Objective (O)</FormLabel>
                      <FormControl>
                        <Textarea
                          className='min-h-[100px]'
                          placeholder='Physical exam findings, vital signs, lab results...'
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
                      <FormLabel>Assessment (A)</FormLabel>
                      <FormControl>
                        <Textarea
                          className='min-h-[100px]'
                          placeholder='Diagnosis, differential diagnoses, problem list...'
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
                      <FormLabel>Plan (P)</FormLabel>
                      <FormControl>
                        <Textarea
                          className='min-h-[100px]'
                          placeholder='Treatment plan, medications, follow-up, referrals...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent
                className='space-y-4'
                value='vitals'
              >
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='vitals.bodyTemperature'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°C)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='36.6'
                            step='0.1'
                            type='number'
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
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
                            onChange={e => field.onChange(e.target.valueAsNumber)}
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
                            onChange={e => field.onChange(e.target.valueAsNumber)}
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
                            onChange={e => field.onChange(e.target.valueAsNumber)}
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
                        <FormLabel>Systolic BP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='120'
                            type='number'
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
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
                        <FormLabel>Diastolic BP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='80'
                            type='number'
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='vitals.weight'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='70.5'
                            step='0.1'
                            type='number'
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='vitals.height'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='175'
                            step='0.1'
                            type='number'
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent
                className='space-y-4'
                value='diagnosis'
              >
                <FormField
                  control={form.control}
                  name='diagnosis'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Primary diagnosis'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='symptoms'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Patient's symptoms..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='treatmentPlan'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Plan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Treatment plan and recommendations...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='labRequest'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab Requests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Any lab tests ordered...'
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
              </TabsContent>

              <TabsContent
                className='space-y-4'
                value='settings'
              >
                <FormField
                  control={form.control}
                  name='isConfidential'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Confidential Record</FormLabel>
                        <p className='text-muted-foreground text-sm'>
                          Mark this record as confidential - only authorized personnel can view it
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='accessLevel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Level</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select access level' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='STANDARD'>Standard</SelectItem>
                          <SelectItem value='SENSITIVE'>Sensitive</SelectItem>
                          <SelectItem value='RESTRICTED'>Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                type='button'
                variant='outline'
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                type='submit'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  'Create Record'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
