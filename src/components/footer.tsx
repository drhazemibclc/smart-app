'use client';

import { Baby, Clock, Heart, Mail, MapPin, Phone, Shield } from 'lucide-react';
import Link from 'next/link';

import { Icons } from './icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='mt-auto border-primary/10 border-t bg-linear-to-br from-background via-background to-primary/5'>
      <div className='container mx-auto px-4 py-12 md:px-6 lg:px-8'>
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {/* Brand Section - Pediatric Focus */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary shadow-lg'>
                <Baby className='h-7 w-7 text-white' />
              </div>
              <div>
                <h2 className='font-bold text-foreground text-xl'>SmartCare</h2>
                <p className='text-muted-foreground text-xs'>Pediatric Clinic</p>
              </div>
            </div>

            <p className='text-muted-foreground text-sm leading-relaxed'>
              Providing compassionate, expert care for your little ones. Your trusted partner in children&apos;s health
              and wellness.
            </p>

            <div className='space-y-2'>
              <div className='flex items-center gap-3 text-muted-foreground text-sm'>
                <MapPin className='h-4 w-4 shrink-0 text-primary' />
                <span>123 Healthcare Avenue, Medical District</span>
              </div>
              <div className='flex items-center gap-3 text-muted-foreground text-sm'>
                <Phone className='h-4 w-4 shrink-0 text-primary' />
                <a
                  className='transition-colors hover:text-primary'
                  href='tel:+1234567890'
                >
                  +1 (234) 567-890
                </a>
              </div>
              <div className='flex items-center gap-3 text-muted-foreground text-sm'>
                <Mail className='h-4 w-4 shrink-0 text-primary' />
                <a
                  className='transition-colors hover:text-primary'
                  href='mailto:care@smartcarepediatric.com'
                >
                  care@smartcarepediatric.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links - For Parents */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground text-sm uppercase tracking-wider'>For Parents</h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  className='inline-block text-muted-foreground text-sm transition-all hover:translate-x-1 hover:text-primary'
                  href='/appointments'
                >
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link
                  className='inline-block text-muted-foreground text-sm transition-all hover:translate-x-1 hover:text-primary'
                  href='/vaccination-schedule'
                >
                  Vaccination Schedule
                </Link>
              </li>
              <li>
                <Link
                  className='inline-block text-muted-foreground text-sm transition-all hover:translate-x-1 hover:text-primary'
                  href='/growth-charts'
                >
                  Growth Charts
                </Link>
              </li>
              <li>
                <Link
                  className='inline-block text-muted-foreground text-sm transition-all hover:translate-x-1 hover:text-primary'
                  href='/parent-resources'
                >
                  Parent Resources
                </Link>
              </li>
              <li>
                <Link
                  className='inline-block text-muted-foreground text-sm transition-all hover:translate-x-1 hover:text-primary'
                  href='/faq'
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Information */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground text-sm uppercase tracking-wider'>Clinic Hours</h3>
            <ul className='space-y-3'>
              <li className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Monday - Friday</span>
                <span className='font-medium'>9:00 AM - 7:00 PM</span>
              </li>
              <li className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Saturday</span>
                <span className='font-medium'>10:00 AM - 4:00 PM</span>
              </li>
              <li className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Sunday</span>
                <span className='font-medium'>Closed</span>
              </li>
              <li className='mt-4 flex items-center gap-2 text-muted-foreground text-sm'>
                <Clock className='h-4 w-4 text-primary' />
                <span>24/7 Emergency Care Available</span>
              </li>
            </ul>

            <div className='pt-4'>
              <Link
                className='inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 font-medium text-red-600 text-sm transition-colors hover:bg-red-500/20'
                href='/emergency'
              >
                <Shield className='h-4 w-4' />
                Emergency Care
              </Link>
            </div>
          </div>

          {/* Connect With Us */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground text-sm uppercase tracking-wider'>Connect With Us</h3>

            <p className='text-muted-foreground text-sm'>
              Follow us on social media for health tips, updates, and parenting resources.
            </p>

            <div className='flex flex-wrap gap-3'>
              <a
                aria-label='Facebook'
                className='flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg'
                href='/#'
              >
                <Icons.facebook className='h-5 w-5' />
              </a>
              <a
                aria-label='Twitter'
                className='flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-sky-600 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg'
                href='/#'
              >
                <Icons.twitter className='h-5 w-5' />
              </a>
              <a
                aria-label='Instagram'
                className='flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-pink-600 to-purple-600 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg'
                href='/#'
              >
                <Icons.instagram className='h-5 w-5' />
              </a>
              <a
                aria-label='WhatsApp'
                className='flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-green-600 to-green-700 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg'
                href='/#'
              >
                <Icons.whatsapp className='h-5 w-5' />
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className='pt-4'>
              <h4 className='mb-2 font-medium text-sm'>Health Tips Newsletter</h4>
              <form
                className='flex gap-2'
                onSubmit={e => e.preventDefault()}
              >
                <input
                  className='flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  placeholder='Your email'
                  type='email'
                />
                <button
                  className='rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90'
                  type='submit'
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-12 border-border border-t pt-8'>
          <div className='flex flex-col items-center justify-between gap-4 text-muted-foreground text-sm md:flex-row'>
            <p>© {currentYear} SmartCare Pediatric Clinic. All rights reserved.</p>

            <div className='flex flex-wrap items-center justify-center gap-4'>
              <Link
                className='transition-colors hover:text-primary'
                href='/privacy'
              >
                Privacy Policy
              </Link>
              <span className='hidden text-border md:inline'>|</span>
              <Link
                className='transition-colors hover:text-primary'
                href='/terms'
              >
                Terms of Service
              </Link>
              <span className='hidden text-border md:inline'>|</span>
              <Link
                className='transition-colors hover:text-primary'
                href='/accessibility'
              >
                Accessibility
              </Link>
            </div>

            <p className='flex items-center gap-1'>
              Made with <Heart className='h-4 w-4 fill-red-500 text-red-500' /> for happy, healthy kids
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
