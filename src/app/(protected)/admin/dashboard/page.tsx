// app/(protected)/admin/dashboard/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getSession } from '@/lib/auth-server';
import { createCaller, getQueryClient, prefetch, trpc } from '@/trpc/server';

import { AdminDashboardClient } from './admin-dashboard';

export default async function AdminDashboardPage() {
  const session = await getSession();
  const clinicId = session?.user?.clinic?.id;

  if (!clinicId) {
    return <div>No clinic access</div>;
  }

  // Get today's day name for doctor availability
  const today = new Date();
  const dayName = today.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

  // Prefetch all queries in parallel using tRPC's queryOptions
  await Promise.all([
    prefetch(trpc.admin.getDashboardStats.queryOptions()),
    prefetch(trpc.admin.getAvailableDoctors.queryOptions({ clinicId, day: dayName })),
    prefetch(trpc.admin.getRecentActivity.queryOptions({ clinicId, limit: 10 })),
    prefetch(trpc.admin.getAppointmentStatus.queryOptions({ clinicId, days: 30 }))
  ]);

  // Create server caller for direct data access if needed
  const caller = await createCaller();
  const initialData = {
    dashboardStats: await caller.admin.getDashboardStats(),
    availableDoctors: await caller.admin.getAvailableDoctors({ clinicId, day: dayName })
  };

  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardClient
        clinicId={clinicId}
        initialData={initialData}
      />
    </HydrationBoundary>
  );
}
