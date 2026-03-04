'use client';

import { Baby, Clock, HeartPulse, Shield, Sparkles, Stethoscope } from 'lucide-react';

import { LoginInForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className='min-h-screen w-full lg:grid lg:grid-cols-2'>
      {/* Left Column: Pediatric Clinic Visual */}
      <div className='relative hidden h-full min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-linear-to-br from-blue-50 via-white to-cyan-50 p-12 lg:flex'>
        {/* Background Effects */}
        <div className='absolute inset-0 z-0'>
          {/* Soft gradient background */}
          <div className='absolute inset-0 bg-linear-to-br from-blue-50/80 via-white/90 to-cyan-50/80' />

          {/* Medical-themed background pattern */}
          <div className='absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] bg-size-[20px_20px] opacity-5' />

          {/* Soft bubbles */}
          <div className='absolute top-20 left-10 h-64 w-64 rounded-full bg-blue-100/30 blur-3xl' />
          <div className='absolute right-10 bottom-20 h-80 w-80 rounded-full bg-cyan-100/30 blur-3xl' />

          {/* Cross pattern overlay */}
          <div className='absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#93C5FD_10px,#93C5FD_20px)] opacity-5' />
        </div>

        {/* Branding */}
        <div className='fade-in slide-in-from-top-4 relative z-10 flex w-full animate-in items-center gap-3 font-medium text-lg tracking-tight duration-700'>
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500'>
              <HeartPulse className='h-6 w-6 text-white' />
            </div>
            <div>
              <span className='bg-linear-to-r from-blue-700 to-cyan-600 bg-clip-text font-bold text-transparent text-xl'>
                Smart Clinic
              </span>
              <span className='block font-normal text-blue-600 text-xs'>Pediatrics</span>
            </div>
          </div>
        </div>

        {/* Clinic Showcase */}
        <div className='relative z-10 my-auto flex max-w-125 flex-col gap-8'>
          <div className='fade-in slide-in-from-bottom-4 animate-in space-y-4 delay-100 duration-700'>
            <div className='inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2'>
              <Sparkles className='h-4 w-4 text-blue-600' />
              <span className='font-medium text-blue-700 text-sm'>Trusted Pediatric Care</span>
            </div>
            <h1 className='font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl'>
              Caring for your child's
              <span className='block bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent'>
                healthy future
              </span>
            </h1>
            <p className='text-gray-600 text-lg'>
              Welcome to Smart Clinic Pediatrics - Where advanced healthcare meets compassionate care for your little
              ones.
            </p>
          </div>

          <div className='grid gap-4'>
            {/* Feature 1 */}
            <div className='group fade-in slide-in-from-right-8 relative animate-in overflow-hidden rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm transition-all delay-200 duration-700 hover:border-blue-200 hover:bg-white hover:shadow-md'>
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600'>
                  <Baby className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Child-Focused Care</h3>
                  <p className='text-gray-600 text-sm'>
                    Specialized pediatric services tailored for infants, children, and adolescents.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className='group fade-in slide-in-from-right-8 relative animate-in overflow-hidden rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm transition-all delay-300 duration-700 hover:border-blue-200 hover:bg-white hover:shadow-md'>
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-cyan-600'>
                  <Stethoscope className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Expert Pediatricians</h3>
                  <p className='text-gray-600 text-sm'>
                    Board-certified pediatric specialists providing comprehensive healthcare.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className='group fade-in slide-in-from-right-8 relative animate-in overflow-hidden rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm transition-all delay-400 duration-700 hover:border-blue-200 hover:bg-white hover:shadow-md'>
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-green-600'>
                  <Clock className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>24/7 Access</h3>
                  <p className='text-gray-600 text-sm'>
                    Manage appointments, view medical records, and connect with doctors anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className='group fade-in slide-in-from-right-8 relative animate-in overflow-hidden rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm transition-all delay-500 duration-700 hover:border-blue-200 hover:bg-white hover:shadow-md'>
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-violet-600'>
                  <Shield className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Secure & HIPAA Compliant</h3>
                  <p className='text-gray-600 text-sm'>
                    Your child's health data is protected with enterprise-grade security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className='relative z-10 w-full'>
          <div className='flex items-center justify-between rounded-2xl border border-blue-100 bg-white/80 p-6 backdrop-blur-sm'>
            <div className='text-center'>
              <div className='font-bold text-2xl text-blue-700'>10K+</div>
              <div className='text-gray-600 text-sm'>Happy Families</div>
            </div>
            <div className='h-12 w-px bg-gray-200' />
            <div className='text-center'>
              <div className='font-bold text-2xl text-cyan-700'>50+</div>
              <div className='text-gray-600 text-sm'>Expert Doctors</div>
            </div>
            <div className='h-12 w-px bg-gray-200' />
            <div className='text-center'>
              <div className='font-bold text-2xl text-green-700'>24/7</div>
              <div className='text-gray-600 text-sm'>Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className='flex min-h-screen items-center justify-center bg-linear-to-b from-white to-blue-50 p-8 lg:p-12'>
        <div className='w-full max-w-112.5 space-y-8'>
          {/* Mobile Header */}
          <div className='lg:hidden'>
            <div className='mb-8 flex items-center justify-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500'>
                <HeartPulse className='h-7 w-7 text-white' />
              </div>
              <div className='text-center'>
                <h1 className='bg-linear-to-r from-blue-700 to-cyan-600 bg-clip-text font-bold text-2xl text-transparent'>
                  Smart Clinic
                </h1>
                <p className='text-blue-600 text-sm'>Pediatric Healthcare Portal</p>
              </div>
            </div>
            <div className='mb-6 rounded-xl bg-linear-to-r from-blue-50 to-cyan-50 p-4 text-center'>
              <h2 className='font-semibold text-gray-900 text-lg'>Welcome back</h2>
              <p className='mt-1 text-gray-600 text-sm'>
                Sign in to access your child's health records and appointments
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-blue-50 shadow-lg'>
            <div className='mb-8 hidden lg:block'>
              <h2 className='font-bold text-2xl text-gray-900'>Welcome to Smart Clinic</h2>
              <p className='mt-2 text-gray-600 text-sm'>
                Sign in to manage appointments, view medical records, and access pediatric care services.
              </p>
            </div>

            <LoginInForm />

            <div className='mt-8 border-gray-100 border-t pt-6'>
              <div className='text-center'>
                <p className='text-gray-600 text-sm'>
                  Need help? Contact our support team at{' '}
                  <a
                    className='font-medium text-blue-600 hover:text-blue-700 hover:underline'
                    href='mailto:support@smartclinic.com'
                  >
                    support@smartclinic.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className='rounded-xl border border-blue-100 bg-white/50 p-4 backdrop-blur-sm'>
            <div className='flex items-center justify-center gap-6'>
              <div className='text-center'>
                <div className='mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
                  <Shield className='h-5 w-5 text-green-600' />
                </div>
                <span className='font-medium text-gray-700 text-xs'>HIPAA Compliant</span>
              </div>
              <div className='h-8 w-px bg-gray-200' />
              <div className='text-center'>
                <div className='mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                  <HeartPulse className='h-5 w-5 text-blue-600' />
                </div>
                <span className='font-medium text-gray-700 text-xs'>Pediatric Certified</span>
              </div>
              <div className='h-8 w-px bg-gray-200' />
              <div className='text-center'>
                <div className='mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100'>
                  <Clock className='h-5 w-5 text-cyan-600' />
                </div>
                <span className='font-medium text-gray-700 text-xs'>24/7 Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
