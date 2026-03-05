import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className='bg-linear-to-r from-primary to-primary/80 py-16 text-primary-foreground'>
      <div className='container mx-auto px-4 text-center'>
        <h2 className='mb-4 font-bold text-3xl'>Ready to Get Started?</h2>
        <p className='mx-auto mb-8 max-w-2xl text-primary-foreground/90'>
          Join thousands of families who trust us with their children's health. Schedule your first appointment today.
        </p>
        <div className='flex flex-wrap justify-center gap-4'>
          <Button
            asChild
            size='lg'
            variant='secondary'
          >
            <Link href='/appointments/new'>Book Appointment</Link>
          </Button>
          <Button
            asChild
            className='border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10'
            size='lg'
            variant='outline'
          >
            <Link href='/contact'>Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
