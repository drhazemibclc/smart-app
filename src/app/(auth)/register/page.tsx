'use client';

import { ArrowRight, Baby, Clock, HeartPulse, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

import { RegisterUserForm } from '@/components/auth/register-user-form';

// ✅ Removed deprecated export const dynamic = 'force-dynamic'
// Client components are dynamic by default with Cache Components enabled

export default function SignupUserPage() {
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
          <div className='absolute top-10 right-10 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl' />
          <div className='absolute bottom-10 left-10 h-64 w-64 rounded-full bg-cyan-100/30 blur-3xl' />

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

        {/* Onboarding Steps Showcase */}
        <div className='relative z-10 my-auto max-w-[500px]'>
          <div className='fade-in slide-in-from-bottom-4 mb-12 animate-in space-y-4 delay-100 duration-700'>
            <div className='inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2'>
              <Sparkles className='h-4 w-4 text-blue-600' />
              <span className='font-medium text-blue-700 text-sm'>Welcome New Families</span>
            </div>
            <h2 className='font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl'>
              Join our caring
              <span className='block bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent'>
                pediatric community
              </span>
            </h2>
            <p className='text-gray-600 text-lg'>
              Create your account to access comprehensive pediatric care, manage appointments, and stay connected with
              your child's health journey.
            </p>
          </div>

          <div className='relative space-y-8 from-blue-200 to-cyan-200 before:absolute before:top-2 before:left-[19px] before:h-[calc(100%-20px)] before:w-[2px] before:bg-linear-to-b'>
            {/* Step 1 */}
            <div className='fade-in slide-in-from-right-8 relative flex animate-in items-start gap-4 delay-200 duration-700'>
              <div className='relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-blue-500 text-white shadow-blue-200 shadow-lg ring-4 ring-white'>
                <span className='font-bold text-sm'>1</span>
              </div>
              <div className='pt-1'>
                <h3 className='flex items-center gap-2 font-semibold text-gray-900 text-lg'>
                  Create Your Family Account
                  <Baby className='h-4 w-4 text-blue-500' />
                </h3>
                <p className='text-gray-600 text-sm'>
                  Register with your family details to access pediatric healthcare services.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className='fade-in slide-in-from-right-8 relative flex animate-in items-start gap-4 delay-300 duration-700'>
              <div className='relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-600 to-cyan-500 text-white shadow-cyan-200 shadow-lg ring-4 ring-white'>
                <span className='font-bold text-sm'>2</span>
              </div>
              <div className='pt-1'>
                <h3 className='flex items-center gap-2 font-semibold text-gray-900 text-lg'>
                  Add Your Children
                  <Users className='h-4 w-4 text-cyan-500' />
                </h3>
                <p className='text-gray-600 text-sm'>
                  Create profiles for each child to manage their individual health records.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className='fade-in slide-in-from-right-8 relative flex animate-in items-start gap-4 delay-400 duration-700'>
              <div className='relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 to-emerald-500 text-white shadow-emerald-200 shadow-lg ring-4 ring-white'>
                <span className='font-bold text-sm'>3</span>
              </div>
              <div className='pt-1'>
                <h3 className='flex items-center gap-2 font-semibold text-gray-900 text-lg'>
                  Access Healthcare Services
                  <ShieldCheck className='h-4 w-4 text-emerald-500' />
                </h3>
                <p className='text-gray-600 text-sm'>
                  Schedule appointments, view medical records, and connect with pediatricians.
                </p>
              </div>
            </div>
          </div>

          {/* Family Benefits */}
          <div className='fade-in slide-in-from-bottom-8 mt-12 animate-in delay-500 duration-700'>
            <div className='rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50/80 to-cyan-50/80 p-6 backdrop-blur-sm'>
              <h4 className='mb-4 font-semibold text-gray-900 text-lg'>Family Benefits</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100'>
                    <Clock className='h-4 w-4 text-blue-600' />
                  </div>
                  <span className='text-gray-700 text-sm'>24/7 Access</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100'>
                    <ShieldCheck className='h-4 w-4 text-cyan-600' />
                  </div>
                  <span className='text-gray-700 text-sm'>HIPAA Secure</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100'>
                    <Baby className='h-4 w-4 text-emerald-600' />
                  </div>
                  <span className='text-gray-700 text-sm'>Child Profiles</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100'>
                    <HeartPulse className='h-4 w-4 text-violet-600' />
                  </div>
                  <span className='text-gray-700 text-sm'>Health Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className='relative z-10 flex w-full justify-between text-sm'>
          <div className='text-gray-600'>
            <p>
              Already have an account?{' '}
              <Link
                className='inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 hover:underline'
                href='/login'
              >
                Sign in here
                <ArrowRight className='h-3 w-3' />
              </Link>
            </p>
          </div>
          <div className='text-gray-500 text-xs'>
            <p>© 2024 Smart Clinic Pediatrics. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className='flex min-h-screen items-center justify-center bg-linear-to-b from-white to-blue-50 p-8 lg:p-12'>
        <div className='w-full max-w-[450px] space-y-8'>
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
              <h2 className='font-semibold text-gray-900 text-lg'>Create Your Family Account</h2>
              <p className='mt-1 text-gray-600 text-sm'>
                Join thousands of families managing their children's health with us
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-blue-50 shadow-lg'>
            <div className='mb-8 hidden lg:block'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500'>
                  <Baby className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h2 className='font-bold text-2xl text-gray-900'>Welcome to Smart Clinic</h2>
                  <p className='mt-1 text-gray-600 text-sm'>
                    Create your account to access pediatric healthcare services
                  </p>
                </div>
              </div>
            </div>

            <RegisterUserForm />

            <div className='mt-8 border-gray-100 border-t pt-6'>
              <div className='text-center'>
                <p className='text-gray-600 text-sm'>
                  By registering, you agree to our{' '}
                  <a
                    className='font-medium text-blue-600 hover:text-blue-700 hover:underline'
                    href='/terms'
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    className='font-medium text-blue-600 hover:text-blue-700 hover:underline'
                    href='/privacy'
                  >
                    Privacy Policy
                  </a>
                </p>
                <p className='mt-3 text-gray-600 text-sm'>
                  Already have an account?{' '}
                  <Link
                    className='font-medium text-blue-600 hover:text-blue-700 hover:underline'
                    href='/login'
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security Assurance */}
          <div className='rounded-xl border border-blue-100 bg-white/50 p-4 backdrop-blur-sm'>
            <div className='mb-3 flex items-center justify-center gap-2'>
              <ShieldCheck className='h-5 w-5 text-emerald-500' />
              <h4 className='font-medium text-gray-900 text-sm'>100% Secure & Private</h4>
            </div>
            <p className='text-center text-gray-600 text-xs'>
              Your family's health information is protected with bank-level encryption and HIPAA compliance standards
            </p>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='rounded-lg bg-blue-50 p-3 text-center'>
              <div className='font-bold text-blue-700 text-lg'>10K+</div>
              <div className='text-blue-600 text-xs'>Families</div>
            </div>
            <div className='rounded-lg bg-cyan-50 p-3 text-center'>
              <div className='font-bold text-cyan-700 text-lg'>50+</div>
              <div className='text-cyan-600 text-xs'>Doctors</div>
            </div>
            <div className='rounded-lg bg-emerald-50 p-3 text-center'>
              <div className='font-bold text-emerald-700 text-lg'>99%</div>
              <div className='text-emerald-600 text-xs'>Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
