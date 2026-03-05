// components/home/stats-cards.tsx
import { cache } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { db } from '../../server/db';

// Data fetching with cache() for deduplication
const getStats = cache(async () => {
  const [patients, appointmentsToday, vaccinesAdministered, activeStaff] = await Promise.all([
    db.patient.count({ where: { isDeleted: false } }),
    db.appointment.count({
      where: {
        appointmentDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    db.immunization.count({
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    }),
    db.user.count({ where: { role: { in: ['DOCTOR', 'STAFF'] } } })
  ]);

  return { patients, appointmentsToday, vaccinesAdministered, activeStaff };
});

export async function StatsCards() {
  const stats = await getStats();

  const items = [
    { title: 'Total Patients', value: stats.patients, icon: '👶' },
    { title: "Today's Appointments", value: stats.appointmentsToday, icon: '📅' },
    { title: 'Vaccines (30d)', value: stats.vaccinesAdministered, icon: '💉' },
    { title: 'Active Staff', value: stats.activeStaff, icon: '👩‍⚕️' }
  ];

  return (
    <div className='grid gap-4 md:grid-cols-4'>
      {items.map(item => (
        <Card key={item.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='font-medium text-sm'>{item.title}</CardTitle>
            <span className='text-2xl'>{item.icon}</span>
          </CardHeader>
          <CardContent>
            <div className='font-bold text-2xl'>{item.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
