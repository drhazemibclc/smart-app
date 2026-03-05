// components/home/testimonials-carousel.tsx

import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

// Static testimonials (can be moved to DB later)
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Parent of 2',
    content:
      "Dr. Smith and the entire staff are amazing. They're patient, kind, and truly care about my children's health.",
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Parent',
    content: 'The clinic is always clean and welcoming. Same-day appointments have been a lifesaver for us.',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Mother of 3',
    content: 'I love how they explain everything in simple terms. My kids actually look forward to their visits!',
    rating: 5
  }
];

export function TestimonialsCarousel() {
  return (
    <div className='grid gap-6 md:grid-cols-3'>
      {testimonials.map(t => (
        <Card key={t.id}>
          <CardContent className='p-6'>
            <div className='mb-4 flex gap-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  className={`h-4 w-4 ${i < t.rating ? 'fill-primary text-primary' : 'text-muted'}`}
                  key={`star-${t.id}-${i}`}
                />
              ))}
            </div>
            <p className='mb-4 text-muted-foreground'>"{t.content}"</p>
            <div>
              <p className='font-semibold'>{t.name}</p>
              <p className='text-muted-foreground text-sm'>{t.role}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
