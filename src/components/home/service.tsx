// components/home/services-showcase.tsx
import { cache } from 'react';

import { Card, CardContent } from '@/components/ui/card';

import { db } from '../../server/db';

const getServices = cache(async () => {
  return db.service.findMany({
    where: { isAvailable: true, isDeleted: false },
    take: 6,
    orderBy: { serviceName: 'asc' }
  });
});

export async function ServicesShowcase() {
  const services = await getServices();

  // Fallback if no services in DB
  const defaultServices = [
    { id: '1', serviceName: 'Well-Child Visits', description: 'Regular checkups to monitor growth', icon: '👶' },
    { id: '2', serviceName: 'Immunizations', description: 'Stay up-to-date with vaccines', icon: '💉' },
    { id: '3', serviceName: 'Sick Visits', description: 'Care for common childhood illnesses', icon: '🏥' },
    { id: '4', serviceName: 'Developmental Screening', description: 'Track milestones', icon: '📊' },
    { id: '5', serviceName: 'Nutrition Counseling', description: 'Healthy eating guidance', icon: '🍎' },
    { id: '6', serviceName: 'Travel Consultations', description: 'Pre-travel health advice', icon: '✈️' }
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {displayServices.map(service => (
        <Card
          className='transition-shadow hover:shadow-lg'
          key={service.id}
        >
          <CardContent className='p-6'>
            <div className='mb-4 text-4xl'>{service.icon || '🏥'}</div>
            <h3 className='mb-2 font-semibold text-xl'>{service.serviceName}</h3>
            <p className='text-muted-foreground'>{service.description || 'Expert pediatric care'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
