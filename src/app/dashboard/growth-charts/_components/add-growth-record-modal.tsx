'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { cn } from '@/lib/utils';

import { decimalSchema } from '../../../../zodSchemas';

const growthRecordSchema = z
  .object({
    patientId: z.string().min(1, 'Patient is required'),
    date: z.date({
      error: 'Date is required'
    }),
    weight: decimalSchema,
    height: decimalSchema,
    headCircumference: decimalSchema,
    notes: z.string().optional()
  })
  .refine(data => !!(data.weight || data.height || data.headCircumference), {
    message: 'At least one measurement is required',
    path: ['weight']
  });

type GrowthRecordForm = z.infer<typeof growthRecordSchema>;

interface AddGrowthRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patients: Array<{ id: string; firstName: string; lastName: string }>;
  onSuccess: () => void;
}

export function AddGrowthRecordModal({
  open,
  onOpenChange,
  patientId,
  patients,
  onSuccess
}: AddGrowthRecordModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GrowthRecordForm>({
    resolver: zodResolver(growthRecordSchema),
    defaultValues: {
      patientId,
      date: new Date(),
      weight: undefined,
      height: undefined,
      headCircumference: undefined,
      notes: ''
    }
  });

  const onSubmit = async (values: GrowthRecordForm) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/trpc/growth.createGrowthRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('Failed to create record');

      toast.success('Growth record added successfully');
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add growth record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={open}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Add Growth Record</DialogTitle>
          <DialogDescription>Enter the patient's growth measurements. Fields with * are required.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='patientId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient *</FormLabel>
                  <Select
                    defaultValue={field.value}
                    disabled={!!patientId}
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
              name='date'
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
                        disabled={date => date > new Date() || date < new Date('1900-01-01')}
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

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='weight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='0.00'
                        step='0.01'
                        type='number'
                        {...field}
                        value={field.value?.toString() ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='height'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='0.0'
                        step='0.1'
                        type='number'
                        {...field}
                        value={field.value?.toString() ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='headCircumference'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head Circumference (cm)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='0.0'
                      step='0.1'
                      type='number'
                      {...field}
                      value={field.value?.toString() ?? ''}
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Optional notes'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? 'Saving...' : 'Save Record'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
