'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Loader2, Lock, Mail, User } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from 'react-aria-components';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type z from 'zod';

import { Button } from '@/components/ui/button';

import { signUpDoctor } from '../../actions/auth/auth-actions';
import { signInWithGoogle } from '../../actions/auth/google-auth-actions';
import { ROLE_REDIRECTS } from '../../lib/routes';
import { SignUpDoctorSchema } from '../../zodSchemas';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

export function RegisterDoctorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof SignUpDoctorSchema>>({
    resolver: zodResolver(SignUpDoctorSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  async function onSubmit(values: z.infer<typeof SignUpDoctorSchema>) {
    setIsLoading(true);
    const toastId = toast.loading('Creating provider account...');

    try {
      const result = await signUpDoctor(values);

      if (result.success) {
        toast.success('Account created successfully!', { id: toastId });
        // Better Auth auto-logs in on signup, refresh and redirect to provider dashboard
        router.refresh();
        router.push(ROLE_REDIRECTS.doctor as Route);
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (error) {
      toast.error('An unexpected error occurred', { id: toastId });
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='fade-in slide-in-from-bottom-4 mx-auto w-full max-w-[400px] animate-in space-y-8 duration-500'>
      {/* Header Section */}
      <div className='flex flex-col space-y-2 text-center md:text-left'>
        <h1 className='font-bold text-3xl text-slate-900 tracking-tight dark:text-white'>Become a provider</h1>
        <p className='text-slate-500 text-sm dark:text-slate-400'>
          Register to connect with patients and manage your practice.
        </p>
      </div>

      <Form {...form}>
        <form
          className='space-y-5'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700 dark:text-slate-300'>Full Name</FormLabel>
                <FormControl>
                  <div className='group relative'>
                    <User className='absolute top-3 left-3 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-sky-500' />
                    <Input
                      placeholder='Dr. Juan Dela Cruz'
                      {...field}
                      className='h-11 border-slate-200 bg-white pl-9 transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-950/50'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700 dark:text-slate-300'>Work Email</FormLabel>
                <FormControl>
                  <div className='group relative'>
                    <Mail className='absolute top-3 left-3 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-sky-500' />
                    <Input
                      placeholder='doctor@clinic.com'
                      {...field}
                      className='h-11 border-slate-200 bg-white pl-9 transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-950/50'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-700 dark:text-slate-300'>Password</FormLabel>
                  <FormControl>
                    <div className='group relative'>
                      <Lock className='absolute top-3 left-3 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-sky-500' />
                      <Input
                        placeholder='••••••'
                        type='password'
                        {...field}
                        className='h-11 border-slate-200 bg-white pl-9 transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-950/50'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-700 dark:text-slate-300'>Confirm</FormLabel>
                  <FormControl>
                    <div className='group relative'>
                      <Lock className='absolute top-3 left-3 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-sky-500' />
                      <Input
                        placeholder='••••••'
                        type='password'
                        {...field}
                        className='h-11 border-slate-200 bg-white pl-9 transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-950/50'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            className='mt-2 h-11 w-full cursor-pointer bg-sky-600 font-semibold text-base text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-700 hover:shadow-sky-500/30'
            disabled={isLoading}
            type='submit'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating account...
              </>
            ) : (
              'Register Practice'
            )}
          </Button>
        </form>
      </Form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-slate-200 border-t dark:border-slate-800' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-slate-50 px-2 text-slate-500 dark:bg-[#0B0F19]'>Or continue with</span>
        </div>
      </div>

      <Button
        className='h-11 w-full cursor-pointer border-slate-200 bg-white font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
        onClick={signInWithGoogle}
        type='button'
        variant='outline'
      >
        <svg
          className='mr-2 h-5 w-5'
          viewBox='0 0 24 24'
        >
          <title>Google</title>
          <path
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            fill='#4285F4'
          />
          <path
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            fill='#34A853'
          />
          <path
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            fill='#FBBC05'
          />
          <path
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            fill='#EA4335'
          />
        </svg>
        Sign up with Google
      </Button>

      <div className='text-center text-slate-600 text-sm dark:text-slate-400'>
        Already have an account?{' '}
        <Link
          className='font-semibold text-sky-600 underline-offset-4 transition-all hover:text-sky-500 hover:underline dark:text-sky-400'
          href='/login'
        >
          Sign in
        </Link>
      </div>

      <div className='pt-4 text-center text-[10px] text-slate-400 dark:text-slate-500'>
        By registering, you agree to our Provider Terms of Service.
      </div>
    </div>
  );
}
