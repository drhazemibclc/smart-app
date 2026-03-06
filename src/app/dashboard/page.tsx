import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { auth } from '@/server/auth';

import Dashboard from './dashboard';

async function DashboardContent() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.user.name}</p>
      <Dashboard session={session} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
