import { redirect } from 'next/navigation';

import { prisma } from '@/db/client';

import { getSession } from '../../../lib/auth-server';
import { GrowthChartsClient } from './_components/client';

export default async function GrowthChartsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Get all patients in the user's clinic
  const patients = await prisma.patient.findMany({
    where: {
      clinicId: session.user.clinic?.id,
      isActive: true
    },
    orderBy: {
      lastName: 'asc'
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true
    }
  });

  // Serialize dates for client component
  const serializedPatients = patients.map(patient => ({
    ...patient,
    dateOfBirth: patient.dateOfBirth.toISOString()
  }));

  return (
    <GrowthChartsClient
      clinicId={session.user.clinic?.id ?? ''}
      patients={serializedPatients}
    />
  );
}
