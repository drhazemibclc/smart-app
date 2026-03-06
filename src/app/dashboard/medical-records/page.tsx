import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { prisma } from '@/db/client';

import { getSession } from '../../../lib/auth-server';
import { MedicalRecordsClient } from './_components/client';

async function MedicalRecordsData() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const clinicId = session.user?.clinic?.id;

  if (!clinicId) {
    redirect('/dashboard');
  }

  // Get patients for filtering
  const patients = await prisma.patient.findMany({
    where: {
      clinicId,
      isActive: true,
      isDeleted: false
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

  // Get doctors for filtering
  const doctors = await prisma.doctor.findMany({
    where: {
      clinicId,
      isActive: true,
      isDeleted: false
    },
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true,
      specialty: true
    }
  });

  // Serialize dates for client component
  const serializedPatients = patients.map(patient => ({
    ...patient,
    dateOfBirth: patient.dateOfBirth.toISOString()
  }));

  return (
    <MedicalRecordsClient
      clinicId={clinicId}
      doctors={doctors}
      patients={serializedPatients}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}

export default function MedicalRecordsPage() {
  return (
    <Suspense fallback={<div>Loading medical records...</div>}>
      <MedicalRecordsData />
    </Suspense>
  );
}
