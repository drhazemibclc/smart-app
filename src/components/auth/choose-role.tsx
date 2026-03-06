import { Baby, Calendar, FileText, HeartPulse, Stethoscope, User } from 'lucide-react';
import { cacheLife } from 'next/cache';
import Link from 'next/link';

import { AuthFooter } from './auth-footer';
import { DownloadAppButton } from './download-app-button';
import { RoleCard } from './role-card';
import { RegistrationRole, type RoleOption } from './types';

// Export as named export to match page import
export async function ChooseRole() {
  'use cache'; // Cache the entire component
  cacheLife('max'); // Cache indefinitely since content is static

  const roles: RoleOption[] = [
    {
      id: RegistrationRole.PATIENT,
      title: 'Patient Account',
      description:
        'Register as a patient to access your medical records, schedule appointments, and manage your health information.',
      href: '/register',
      visualIcon: (
        <Baby
          size={32}
          strokeWidth={2}
        />
      ),
      primaryColor: 'from-blue-500 to-cyan-500',
      buttonText: 'Register as Patient',
      features: [
        { icon: <Calendar />, text: 'Schedule appointments' },
        { icon: <FileText />, text: 'View medical records' },
        { icon: <HeartPulse />, text: 'Track health history' },
        { icon: <User />, text: 'Manage profile information' }
      ]
    },
    {
      id: RegistrationRole.DOCTOR,
      title: 'Doctor Account',
      description: 'Register as a healthcare provider to manage patients, create medical records, and provide care.',
      href: '/register-provider',
      visualIcon: (
        <Stethoscope
          size={32}
          strokeWidth={2}
        />
      ),
      primaryColor: 'from-teal-500 to-emerald-500',
      buttonText: 'Register as Doctor',
      features: [
        { icon: <Stethoscope />, text: 'Manage patient care' },
        { icon: <FileText />, text: 'Create medical records' },
        { icon: <Calendar />, text: 'Schedule appointments' },
        { icon: <HeartPulse />, text: 'Prescribe medications' }
      ]
    }
  ];

  return (
    <div className='flex min-h-screen flex-col bg-slate-50 font-sans transition-colors duration-300 selection:bg-brand-100 selection:text-brand-900 dark:bg-[#0B0F19]'>
      <main className='relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8'>
        {/* Background Decor */}
        <div className='absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-brand-100/40 opacity-50 blur-3xl dark:bg-cyan-900/20' />

        <div className='w-full max-w-5xl space-y-12'>
          <div className='mx-auto max-w-2xl space-y-4 text-center'>
            <h1 className='font-bold text-4xl text-slate-900 tracking-tight md:text-4xl dark:text-white'>
              Choose your <span className='text-brand-600 dark:text-cyan-400'>Account Type</span>
            </h1>
            <p className='mx-auto max-w-xl text-lg text-slate-600 leading-relaxed dark:text-slate-400'>
              A production-ready Next.js starter kit with authentication, database, and beautiful UI components.
            </p>
          </div>

          <div className='mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:gap-8'>
            {roles.map(role => (
              <RoleCard
                key={role.id}
                role={role}
              />
            ))}
          </div>

          <div className='mt-8 flex flex-col items-center gap-4'>
            <DownloadAppButton href='/download' />
            <p className='text-center text-slate-400 text-sm dark:text-slate-500'>
              Already have an account?{' '}
              <Link
                className='font-medium text-brand-600 hover:underline dark:text-cyan-400'
                href='/login'
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}

// Also export as default for backward compatibility if needed
export default ChooseRole;
