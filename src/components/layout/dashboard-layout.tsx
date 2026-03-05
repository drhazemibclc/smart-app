import type React from 'react';

import { AppHeader } from './app-header';
import { Sidebar } from './sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen flex-col'>
      <AppHeader title='Dashboard' />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  );
}
