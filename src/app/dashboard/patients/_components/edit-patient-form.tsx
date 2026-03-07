'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/trpc/query-client';

const patientFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  email: z.email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().or(z.literal('')),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medicalHistory: z.string().optional()
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface Patient {
  address: string | null;
  allergies: string | null;
  bloodGroup: string | null;
  dateOfBirth: Date;
  email: string | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  firstName: string;
  gender: 'MALE' | 'FEMALE';
  id: string;
  lastName: string;
  medicalConditions: string | null;
  medicalHistory: string | null;
  phone: string | null;
}

interface EditPatientFormProps {
  patient: Patient;
  patientId: string;
}

export function EditPatientForm({ patient, patientId }: EditPatientFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: format(new Date(patient.dateOfBirth), 'yyyy-MM-dd'),
      gender: patient.gender,
      email: patient.email || '',
      phone: patient.phone || '',
      address: patient.address || '',
      emergencyContactName: patient.emergencyContactName || '',
      emergencyContactNumber: patient.emergencyContactNumber || '',
      bloodGroup: (patient.bloodGroup as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-') || '',
      allergies: patient.allergies || '',
      medicalConditions: patient.medicalConditions || '',
      medicalHistory: patient.medicalHistory || ''
    }
  });

  const updateMutation = useMutation(
    trpc.patient.update.mutationOptions({
      onSuccess: () => {
        toast.success('Patient updated successfully');
        queryClient.invalidateQueries({ queryKey: ['patient'] });
        router.push(`/dashboard/patients/${patientId}`);
        router.refresh();
      },
      onError: error => {
        toast.error(error.message || 'Failed to update patient');
      }
    })
  );

  const onSubmit = (values: PatientFormValues) => {
    updateMutation.mutate({
      id: patientId,
      data: {
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: new Date(values.dateOfBirth),
        gender: values.gender,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        emergencyContactName: values.emergencyContactName || null,
        emergencyContactNumber: values.emergencyContactNumber || null,
        bloodGroup: values.bloodGroup || null,
        allergies: values.allergies || null,
        medicalConditions: values.medicalConditions || null,
        medicalHistory: values.medicalHistory || null
      }
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
            <Label htmlFor='firstName'>First Name *</Label>
            <Input
              className='mt-2'
              id='firstName'
              placeholder='John'
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor='lastName'>Last Name *</Label>
            <Input
              className='mt-2'
              id='lastName'
              placeholder='Doe'
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <div>
            <Label htmlFor='dateOfBirth'>Date of Birth *</Label>
            <Input
              className='mt-2'
              id='dateOfBirth'
              type='date'
              {...form.register('dateOfBirth')}
            />
            {form.formState.errors.dateOfBirth && (
              <p className='mt-1 text-destructive text-sm'>{form.formState.errors.dateOfBirth.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor='gender'>Gender *</Label>
            <Select
              onValueChange={value => form.setValue('gender', value as 'MALE' | 'FEMALE')}
              value={form.watch('gender')}
            >
              <SelectTrigger
                className='mt-2'
                id='gender'
              >
                <SelectValue placeholder='Select gender' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='MALE'>Male</SelectItem>
                <SelectItem value='FEMALE'>Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <div>
            <Label htmlFor='email'>Email</Label>
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
            <Label htmlFor='phone'>Phone</Label>
            <Input
              className='mt-2'
              id='phone'
              placeholder='+1234567890'
              {...form.register('phone')}
            />
          </div>
        </div>

        <div>
          <Label htmlFor='address'>Address</Label>
          <Textarea
            className='mt-2'
            id='address'
            placeholder='123 Main St, City, Country'
            rows={2}
            {...form.register('address')}
          />
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <div>
            <Label htmlFor='emergencyContactName'>Emergency Contact Name</Label>
            <Input
              className='mt-2'
              id='emergencyContactName'
              placeholder='Parent/Guardian name'
              {...form.register('emergencyContactName')}
            />
          </div>
          <div>
            <Label htmlFor='emergencyContactNumber'>Emergency Contact Phone</Label>
            <Input
              className='mt-2'
              id='emergencyContactNumber'
              placeholder='+1234567890'
              {...form.register('emergencyContactNumber')}
            />
          </div>
        </div>

        <div>
          <Label htmlFor='bloodGroup'>Blood Group</Label>
          <Select
            onValueChange={value =>
              form.setValue('bloodGroup', value as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-')
            }
            value={form.watch('bloodGroup')}
          >
            <SelectTrigger
              className='mt-2'
              id='bloodGroup'
            >
              <SelectValue placeholder='Select blood group' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='A+'>A+</SelectItem>
              <SelectItem value='A-'>A-</SelectItem>
              <SelectItem value='B+'>B+</SelectItem>
              <SelectItem value='B-'>B-</SelectItem>
              <SelectItem value='AB+'>AB+</SelectItem>
              <SelectItem value='AB-'>AB-</SelectItem>
              <SelectItem value='O+'>O+</SelectItem>
              <SelectItem value='O-'>O-</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='allergies'>Allergies</Label>
          <Textarea
            className='mt-2'
            id='allergies'
            placeholder='List any allergies (medications, food, etc.)'
            rows={2}
            {...form.register('allergies')}
          />
        </div>

        <div>
          <Label htmlFor='medicalConditions'>Medical Conditions</Label>
          <Textarea
            className='mt-2'
            id='medicalConditions'
            placeholder='List any chronic medical conditions'
            rows={2}
            {...form.register('medicalConditions')}
          />
        </div>

        <div>
          <Label htmlFor='medicalHistory'>Medical History</Label>
          <Textarea
            className='mt-2'
            id='medicalHistory'
            placeholder='Brief medical history'
            rows={3}
            {...form.register('medicalHistory')}
          />
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
            Update Patient
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
