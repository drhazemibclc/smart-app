'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  appointments: 'Appointments',
  doctors: 'Doctors',
  patients: 'Patients'
};

export function AppBreadcrumb() {
  const pathname = usePathname();

  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = breadcrumbLabels[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
      label,
      href
    };
  });

  return (
    <Breadcrumb className='mb-4'>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href='/'>Start</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  className={cn(
                    index === breadcrumbs.length - 1 && 'pointer-events-none text-blue-500 dark:text-[#B253FF]'
                  )}
                  href={crumb.href as Route}
                >
                  {crumb.label}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
