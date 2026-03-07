'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { trpc } from '@/utils/trpc';

import type { Weekday } from '../../types/data-types';
import { specialty } from '../../utils/seetings';
import { CreateNewDoctorInputSchema, type workingDaySchema } from '../../zodSchemas';
import { CustomInput, SwitchInput } from '../custom-input';

type CreateNewDoctorInput = z.infer<typeof CreateNewDoctorInputSchema>;

const TYPES = [
  { label: 'Full-Time', value: 'FULL' },
  { label: 'Part-Time', value: 'PART' }
];

const WORKINGDAYS: { label: string; value: Weekday }[] = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' }
];

type Day = z.infer<typeof workingDaySchema>;

export const DoctorForm = () => {
  const router = useRouter();
  const [workSchedule, setWorkSchedule] = useState<Day[]>([]);

  const form = useForm({
    resolver: zodResolver(CreateNewDoctorInputSchema) as Resolver<CreateNewDoctorInput>,
    defaultValues: {
      clinicId: '',
      name: '',
      email: '',
      phone: '',
      specialty: '',
      address: '',
      appointmentPrice: 9,
      type: 'FULL',
      department: '',
      img: '',
      password: '',
      licenseNumber: '',
      availableFromTime: '',
      availableToTime: '',
      colorCode: ''
    }
  });

  const createDoctorMutation = useMutation(
    trpc.admin.createNewDoctor.mutationOptions({
      onSuccess: resp => {
        if (resp.success) {
          toast.success(resp.message || 'Doctor added successfully!');
          setWorkSchedule([]);
          form.reset();
          router.refresh();
        } else {
          toast.error(resp.message || 'Failed to add doctor');
        }
      },
      onError: (error: unknown) => {
        const e = error as Error;
        console.error('Error creating doctor:', e);
        toast.error(e.message || 'Something went wrong');
      }
    })
  );

  const { isPending } = createDoctorMutation;

  const handleSubmit = async (values: z.infer<typeof CreateNewDoctorInputSchema>) => {
    if (workSchedule.length === 0) {
      toast.error('Please select working days');
      return;
    }

    await createDoctorMutation.mutateAsync({
      ...values,
      password: values.password ?? '',
      workSchedule: workSchedule
    });
  };

  const selectedspecialty = form.watch('specialty');
  useEffect(() => {
    if (selectedspecialty) {
      const department = specialty.find(el => el.value === selectedspecialty);
      if (department) {
        form.setValue('department', department.department);
      }
    }
  }, [selectedspecialty, form]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusIcon size={20} /> Add Doctor
        </Button>
      </SheetTrigger>

      <SheetContent className='w-full overflow-y-scroll rounded-xl rounded-r-xl md:top-[5%] md:right-[1%] md:h-[90%]'>
        <SheetHeader>
          <SheetTitle>Add New Doctor</SheetTitle>
        </SheetHeader>

        <div>
          <Form {...form}>
            <form
              className='mt-5 space-y-8 2xl:mt-10'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <CustomInput
                control={form.control}
                defaultValue='FULL'
                label='Type'
                name='type'
                placeholder=''
                selectList={TYPES}
                type='radio'
              />

              <CustomInput
                control={form.control}
                label='Full Name'
                name='name'
                placeholder="Doctor's name"
                type='input'
              />

              <div className='flex items-center gap-2'>
                <CustomInput
                  control={form.control}
                  label='specialty'
                  name='specialty'
                  placeholder='Select specialty'
                  selectList={specialty}
                  type='select'
                />
                <CustomInput
                  control={form.control}
                  label='Department'
                  name='department'
                  placeholder='OPD'
                  type='input'
                />
              </div>

              <CustomInput
                control={form.control}
                inputType='password'
                label='Password'
                name='password'
                placeholder=''
                type='input'
              />

              <div className='mt-6'>
                <Label>Working Days</Label>
                <SwitchInput
                  data={WORKINGDAYS}
                  setWorkSchedule={setWorkSchedule}
                />
              </div>

              <Button
                className='w-full'
                disabled={isPending}
                type='submit'
              >
                Submit
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
