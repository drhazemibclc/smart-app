// app/(protected)/layout.tsx - IMPROVED
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import type React from 'react';

import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { getRoleRedirectPath, requireAuth } from '@/lib/auth-server';
import type { Role } from '@/types/auth';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Get authenticated session
  const session = await requireAuth();
  const user = session.user;

  // Better-Auth returns lowercase roles, ensure we normalize
  const userRole = (user.role?.toLowerCase() || 'patient') as Role;

  // Redirect to role-appropriate dashboard if needed
  const rolePath = getRoleRedirectPath(userRole);

  // Only redirect if we're on the base dashboard
  // Individual pages will handle their own role-based access
  const shouldRedirect = rolePath && rolePath !== '/dashboard';

  if (shouldRedirect) {
    redirect(rolePath as Route);
  }

  return (
    <div className='flex h-screen w-full bg-gray-200'>
      <div className='hidden w-[14%] md:block md:w-[8%] lg:w-[16%] xl:w-[14%]'>
        <Sidebar />
      </div>

      <div className='flex w-full flex-col bg-[#F7F8FA] md:w-[92%] lg:w-[84%] xl:w-[86%]'>
        <Navbar />

        <main className='h-full w-full overflow-y-auto p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
