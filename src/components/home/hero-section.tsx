// components/home/hero-section.tsx
import { ArrowRight, Award, Baby, Calendar, Heart, Shield, Star, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className='relative overflow-hidden bg-linear-to-b from-primary/5 to-background py-20 md:py-32'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent' />

      <div className='container mx-auto px-4'>
        <div className='grid items-center gap-12 lg:grid-cols-2'>
          <div className='space-y-6'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary'>
              <Heart className='h-4 w-4' />
              <span className='font-medium text-sm'>Compassionate Care for Little Ones</span>
            </div>

            <h1 className='font-bold text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl'>
              Your Child's Health Is Our{' '}
              <span className='bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
                Top Priority
              </span>
            </h1>

            <p className='max-w-xl text-lg text-muted-foreground'>
              Welcome to Pediatric Clinic – where we provide expert, compassionate healthcare for children from birth
              through adolescence. Our team of specialists is here to support your family every step of the way.
            </p>

            <div className='flex flex-wrap gap-4'>
              <Button
                asChild
                className='gap-2'
                size='lg'
              >
                <Link href='/dashboard'>
                  Access Portal <ArrowRight className='h-4 w-4' />
                </Link>
              </Button>
              <Button
                asChild
                size='lg'
                variant='outline'
              >
                <Link href='/services'>Our Services</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className='flex flex-wrap items-center gap-6 pt-6'>
              <div className='flex items-center gap-2'>
                <Shield className='h-5 w-5 text-primary' />
                <span className='font-medium text-sm'>HIPAA Compliant</span>
              </div>
              <div className='flex items-center gap-2'>
                <Award className='h-5 w-5 text-primary' />
                <span className='font-medium text-sm'>Board Certified</span>
              </div>
              <div className='flex items-center gap-2'>
                <Star className='h-5 w-5 fill-primary text-primary' />
                <span className='font-medium text-sm'>4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className='relative hidden lg:block'>
            <div className='relative aspect-square overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20'>
              <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
              <div className='absolute inset-0 flex items-center justify-center'>
                <Baby className='h-48 w-48 text-primary/40' />
              </div>
            </div>

            {/* Floating Stats Cards */}
            <div className='absolute top-1/2 -left-8 animate-float rounded-lg bg-background p-4 shadow-lg'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-green-100 p-2 dark:bg-green-900'>
                  <Users className='h-4 w-4 text-green-600 dark:text-green-300' />
                </div>
                <div>
                  <p className='font-bold text-2xl'>5,000+</p>
                  <p className='text-muted-foreground text-xs'>Happy Families</p>
                </div>
              </div>
            </div>

            <div className='absolute -right-8 -bottom-8 animate-float-delayed rounded-lg bg-background p-4 shadow-lg'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-blue-100 p-2 dark:bg-blue-900'>
                  <Calendar className='h-4 w-4 text-blue-600 dark:text-blue-300' />
                </div>
                <div>
                  <p className='font-bold text-2xl'>24/7</p>
                  <p className='text-muted-foreground text-xs'>Appointments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
