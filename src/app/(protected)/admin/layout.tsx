// app/(protected)/admin/layout.tsx

import type { ReactNode } from 'react';

import { Sidebar } from '@/components/sidebar';
import { requireRole } from '@/lib/auth-server';

/**
 * Admin Layout - Wraps admin routes
 * Requires admin role access
 */

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Require admin role - will redirect if not admin
  await requireRole('admin');

  return (
    <div className='flex h-screen w-full bg-gray-200'>
      {/* Sidebar with role-specific navigation */}
      <div className='hidden w-[14%] md:block md:w-[8%] lg:w-[16%] xl:w-[14%]'>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className='flex w-full flex-col bg-[#F7F8FA] md:w-[92%] lg:w-[84%] xl:w-[86%]'>
        {/* Scrollable content area */}
        <main className='h-full w-full overflow-y-auto p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
