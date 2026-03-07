'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Define your schema (make sure this matches your imported StaffAuthSchema)
const StaffAuthSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export function StaffAuthForm() {
  const form = useForm<z.infer<typeof StaffAuthSchema>>({
    resolver: zodResolver(StaffAuthSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  async function onSubmit(values: z.infer<typeof StaffAuthSchema>) {
    try {
      // Handle form submission
      console.log(values);
    } catch (error) {
      console.error('Form submission error', error);
    }
  }

  return (
    <Form {...form}>
      <form
        className='space-y-4'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter your email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter your password'
                  type='password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className='w-full'
          type='submit'
        >
          Sign In
        </Button>
      </form>
    </Form>
  );
}
