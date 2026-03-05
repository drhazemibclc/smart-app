// components/home/quick-actions-grid.tsx
import { Calendar, DollarSign, FileText, Plane, Syringe, Users } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';

const actions = [
  { title: 'Book Appointment', href: '/dashboard/appointments/new', icon: Calendar, color: 'text-blue-500' },
  { title: 'View Patients', href: '/dashboard/patients', icon: Users, color: 'text-green-500' },
  { title: 'Vaccine Schedule', href: '/dashboard/vaccines/schedule', icon: Syringe, color: 'text-purple-500' },
  { title: 'Medical Records', href: '/dashboard/medical-records', icon: FileText, color: 'text-orange-500' },
  { title: 'Travel Clearance', href: '/dashboard/travel-clearances', icon: Plane, color: 'text-teal-500' },
  { title: 'Billing', href: '/dashboard/billing', icon: DollarSign, color: 'text-red-500' }
];

export function QuickActionsGrid() {
  return (
    <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-6'>
      {actions.map(action => {
        const Icon = action.icon;
        return (
          <Link
            href={action.href}
            key={action.title}
          >
            <Card className='transition-colors hover:bg-muted/50'>
              <CardContent className='flex flex-col items-center p-4 text-center'>
                <Icon className={`mb-2 h-8 w-8 ${action.color}`} />
                <span className='font-medium text-sm'>{action.title}</span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
