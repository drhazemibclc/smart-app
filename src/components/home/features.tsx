// components/home/features-grid.tsx
import { CheckCircle2 } from 'lucide-react';

const features = [
  {
    title: 'Board-Certified Pediatricians',
    description: 'Our team consists of experienced, board-certified pediatric specialists.'
  },
  {
    title: 'Child-Friendly Environment',
    description: 'Designed to make children feel comfortable and reduce anxiety.'
  },
  {
    title: 'Same-Day Appointments',
    description: 'We accommodate urgent needs with flexible scheduling.'
  },
  {
    title: 'Electronic Health Records',
    description: 'Secure, accessible medical records for coordinated care.'
  },
  {
    title: 'After-Hours Advice',
    description: 'Phone support for non-emergency concerns after hours.'
  },
  {
    title: 'Insurance Assistance',
    description: 'Help with claims and billing questions.'
  }
];

export function FeaturesGrid() {
  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {features.map(feature => (
        <div
          className='flex gap-3'
          key={feature.title}
        >
          <CheckCircle2 className='mt-1 h-5 w-5 flex-shrink-0 text-primary' />
          <div>
            <h3 className='font-semibold'>{feature.title}</h3>
            <p className='text-muted-foreground text-sm'>{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
