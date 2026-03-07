// src/modules/billing/components/payment-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTRPC } from '@/trpc/client';
import { calculateDueDate } from '@/utils/bill';
import { type CreatePaymentInput, CreatePaymentSchema } from '@/zodSchemas/billing.schema';

interface PaymentFormProps {
  onSuccess?: () => void;
}

interface BillItem {
  serviceId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  serviceDate: Date;
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Get available services
  const { data: services } = useQuery(trpc.Payment.getServices.queryOptions());

  const form = useForm<CreatePaymentInput>({
    resolver: zodResolver(CreatePaymentSchema),
    defaultValues: {
      patientId: '',
      appointmentId: '',
      amount: 0,
      discount: 0,
      paymentMethod: 'CASH' as const,
      status: 'UNPAID' as const,
      notes: '',
      dueDate: calculateDueDate(30),
      bills: []
    }
  });

  const createMutation = useMutation(
    trpc.Payment.create.mutationOptions({
      onSuccess: () => {
        toast.success('Payment created successfully');
        queryClient.invalidateQueries(trpc.Payment.getByClinic.queryFilter());
        queryClient.invalidateQueries(trpc.Payment.getStats.queryFilter());
        onSuccess?.();
      },
      onError: error => {
        toast.error(error.message);
      }
    })
  );

  const addBillItem = () => {
    setBillItems([
      ...billItems,
      {
        serviceId: '',
        quantity: 1,
        unitCost: 0,
        totalCost: 0,
        serviceDate: new Date()
      }
    ]);
  };

  const removeBillItem = (index: number) => {
    const newItems = [...billItems];
    newItems.splice(index, 1);
    setBillItems(newItems);
    calculateTotal(newItems);
  };

  const updateBillItem = <K extends keyof BillItem>(index: number, field: K, value: BillItem[K]) => {
    const newItems = [...billItems];
    (newItems[index] as BillItem)[field] = value;

    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = (field === 'quantity' ? value : newItems[index].quantity) as number;
      const unitCost = (field === 'unitCost' ? value : newItems[index].unitCost) as number;
      newItems[index].totalCost = quantity * unitCost;
    }

    setBillItems(newItems);
    calculateTotal(newItems);
  };

  const calculateTotal = (items: typeof billItems) => {
    const total = items.reduce((sum, item) => sum + item.totalCost, 0);
    form.setValue('amount', total);
    form.setValue('bills', items);
  };

  const onSubmit = (data: CreatePaymentInput) => {
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='patientId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Search patient...'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='appointmentId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Search appointment...'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bill Items */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='font-medium text-lg'>Services</h3>
            <Button
              onClick={addBillItem}
              size='sm'
              type='button'
              variant='outline'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Service
            </Button>
          </div>

          {billItems.map((item, index) => (
            <Card key={index}>
              <CardContent className='pt-6'>
                <div className='grid grid-cols-5 gap-4'>
                  <div className='col-span-2'>
                    <FormLabel>Service</FormLabel>
                    <Select
                      onValueChange={value => updateBillItem(index, 'serviceId', value)}
                      value={item.serviceId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select service' />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map(service => (
                          <SelectItem
                            key={service.id}
                            value={service.id}
                          >
                            {service.serviceName} - {Number(service.price).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FormLabel>Quantity</FormLabel>
                    <Input
                      min='1'
                      onChange={e => updateBillItem(index, 'quantity', Number.parseInt(e.target.value, 10))}
                      type='number'
                      value={item.quantity}
                    />
                  </div>

                  <div>
                    <FormLabel>Unit Cost</FormLabel>
                    <Input
                      min='0'
                      onChange={e => updateBillItem(index, 'unitCost', Number.parseFloat(e.target.value))}
                      step='0.01'
                      type='number'
                      value={item.unitCost}
                    />
                  </div>

                  <div>
                    <FormLabel>Total</FormLabel>
                    <Input
                      className='bg-gray-50'
                      disabled
                      type='number'
                      value={item.totalCost}
                    />
                  </div>

                  <div className='flex items-end'>
                    <Button
                      className='text-red-600'
                      onClick={() => removeBillItem(index)}
                      size='icon'
                      type='button'
                      variant='ghost'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount</FormLabel>
                <FormControl>
                  <Input
                    step='0.01'
                    type='number'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='discount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <Input
                    step='0.01'
                    type='number'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='paymentMethod'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select method' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='CASH'>Cash</SelectItem>
                    <SelectItem value='CARD'>Card</SelectItem>
                    <SelectItem value='MOBILE'>Mobile</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='PAID'>Paid</SelectItem>
                    <SelectItem value='UNPAID'>Unpaid</SelectItem>
                    <SelectItem value='PARTIAL'>Partial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dueDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input
                    onChange={e => field.onChange(new Date(e.target.value))}
                    type='date'
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
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
              <FormItem className='col-span-2'>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end gap-2'>
          <Button
            onClick={onSuccess}
            type='button'
            variant='outline'
          >
            Cancel
          </Button>
          <Button
            disabled={createMutation.isPending}
            type='submit'
          >
            {createMutation.isPending ? 'Creating...' : 'Create Payment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
