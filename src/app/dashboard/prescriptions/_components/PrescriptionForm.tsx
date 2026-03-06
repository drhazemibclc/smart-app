// src/app/(protected)/prescriptions/components/PrescriptionForm.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Doctor, Drug, Patient } from '@/prisma/types';
import { trpc } from '@/utils/trpc';

import { type CreatePrescriptionInput, CreatePrescriptionSchema } from '../../../../zodSchemas';

interface PrescriptionFormProps {
  initialPatient?: Patient | null;
  initialMedicalRecordId?: string;
  initialEncounterId?: string;
  doctors: Doctor[];
  drugs: Drug[];
  clinicId: string;
  doctorId: string;
}

export function PrescriptionForm({
  initialPatient,
  initialMedicalRecordId,
  initialEncounterId,
  doctors,
  drugs,
  doctorId
}: PrescriptionFormProps) {
  const router = useRouter();
  const [_selectedPatient, _setSelectedPatient] = useState(initialPatient);

  // Initialize form with explicit typing
  const form = useForm<CreatePrescriptionInput>({
    resolver: zodResolver(CreatePrescriptionSchema),
    defaultValues: {
      patientId: initialPatient?.id || '',
      medicalRecordId: initialMedicalRecordId || '',
      encounterId: initialEncounterId || '',
      doctorId,
      medicationName: '',
      instructions: '',
      issuedDate: new Date(),
      status: 'active',
      prescribedItems: [
        {
          drugId: '',
          drug: undefined,
          dosageValue: 0,
          dosageUnit: 'MG',
          frequency: '',
          duration: '',
          drugRoute: undefined, // Add this if it's in your schema
          instructions: '' // Add this if it's in your schema
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'prescribedItems'
  });

  const createPrescription = useMutation(
    trpc.prescription.create.mutationOptions({
      onSuccess: () => {
        toast.success('Prescription created successfully');
        router.push('/prescriptions');
        router.refresh();
      },
      onError: error => {
        toast.error(error.message || 'Failed to create prescription');
      }
    })
  );

  const onSubmit = (data: CreatePrescriptionInput) => {
    createPrescription.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className='space-y-8'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Patient Selection - Note: You need to implement or import PatientSearch component */}
        <FormField
          control={form.control}
          name='patientId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient *</FormLabel>
              <FormControl>
                {/* You need to create this component or replace with a Select */}
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a patient' />
                  </SelectTrigger>
                  <SelectContent>{/* Add patient options here */}</SelectContent>
                </Select>
              </FormControl>
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
              <FormLabel>Prescribing Doctor *</FormLabel>
              <Select
                defaultValue={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a doctor' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map(doctor => (
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

        {/* Prescribed Items */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <FormLabel>Medications *</FormLabel>
            <Button
              onClick={() =>
                append({
                  drugId: '',
                  drug: undefined,
                  dosageValue: 0,
                  dosageUnit: 'MG',
                  frequency: '',
                  duration: '',
                  drugRoute: undefined,
                  instructions: ''
                })
              }
              size='sm'
              type='button'
              variant='outline'
            >
              <PlusCircle className='mr-2 h-4 w-4' />
              Add Medication
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className='pt-6'>
                <div className='relative grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  <Button
                    className='absolute -top-2 -right-2'
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    size='icon'
                    type='button'
                    variant='ghost'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>

                  {/* Drug Selection */}
                  <FormField
                    control={form.control}
                    name={`prescribedItems.${index}.drugId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select drug' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {drugs.map(drug => (
                              <SelectItem
                                key={drug.id}
                                value={drug.id}
                              >
                                {drug.name} {drug.id ? `- ${drug.name}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dosage Value */}
                  <FormField
                    control={form.control}
                    name={`prescribedItems.${index}.dosageValue`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input
                            step='0.01'
                            type='number'
                            {...field}
                            onChange={e => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : 0)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dosage Unit */}
                  <FormField
                    control={form.control}
                    name={`prescribedItems.${index}.dosageUnit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select unit' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='MG'>mg</SelectItem>
                            <SelectItem value='ML'>ml</SelectItem>
                            <SelectItem value='TABLET'>tablet(s)</SelectItem>
                            <SelectItem value='MCG'>mcg</SelectItem>
                            <SelectItem value='G'>g</SelectItem>
                            <SelectItem value='IU'>IU</SelectItem>
                            <SelectItem value='DROP'>drop(s)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Frequency */}
                  <FormField
                    control={form.control}
                    name={`prescribedItems.${index}.frequency`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., Once daily, Every 8 hours'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name={`prescribedItems.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 7 days, 2 weeks'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Route */}
                  <FormField
                    control={form.control}
                    name={`prescribedItems.${index}.drugRoute`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select route' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='PO'>Oral (PO)</SelectItem>
                            <SelectItem value='IV'>Intravenous (IV)</SelectItem>
                            <SelectItem value='IM'>Intramuscular (IM)</SelectItem>
                            <SelectItem value='SC'>Subcutaneous (SC)</SelectItem>
                            <SelectItem value='TOPICAL'>Topical</SelectItem>
                            <SelectItem value='INHALED'>Inhaled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Instructions */}
                  <FormField
                    control={form.control}
                    name={`prescribedItems.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem className='md:col-span-2 lg:col-span-3'>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., Take with food'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Instructions */}
        <FormField
          control={form.control}
          name='instructions'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Instructions</FormLabel>
              <FormControl>
                <Textarea
                  className='min-h-[100px]'
                  placeholder='Any additional instructions for the patient...'
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date */}
        <FormField
          control={form.control}
          name='endDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valid Until (Optional)</FormLabel>
              <FormControl>
                <Input
                  onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  type='date'
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                />
              </FormControl>
              <FormDescription>Leave empty for ongoing prescriptions</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hidden Fields */}
        <input
          type='hidden'
          {...form.register('medicalRecordId')}
        />
        <input
          type='hidden'
          {...form.register('encounterId')}
        />

        <div className='flex justify-end space-x-4'>
          <Button
            onClick={() => router.back()}
            type='button'
            variant='outline'
          >
            Cancel
          </Button>
          <Button
            disabled={createPrescription.isPending}
            type='submit'
          >
            {createPrescription.isPending ? 'Creating...' : 'Create Prescription'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
