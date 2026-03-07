// components/navbar.tsx
'use client';

import { Bell, Menu, Search } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { Input } from './ui/input';

interface NavbarProps {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  showSearch?: boolean;
  className?: string;
}

export const Navbar = ({ showMenuButton = false, onMenuClick, showSearch = true, className }: NavbarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Memoize the formatted path to prevent unnecessary recalculations
  const formattedPath = useMemo(() => {
    if (!pathname) return 'Overview';

    // Split the pathname and get the relevant segment
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) return 'Overview';

    // For better UX, use the last segment or handle specific routes
    const lastSegment = segments.at(-1);

    if (!lastSegment) return 'Overview';

    // Handle common routes with better display names
    const routeNames: Record<string, string> = {
      '': 'Dashboard',
      dashboard: 'Dashboard',
      patients: 'Patients',
      doctors: 'Doctors',
      staff: 'Staff',
      appointments: 'Appointments',
      appointment: 'Appointment Details',
      'medical-records': 'Medical Records',
      prescriptions: 'Prescriptions',
      immunizations: 'Immunizations',
      'growth-charts': 'Growth Charts',
      billing: 'Billing',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'My Profile',
      admin: 'Administration',
      clinic: 'Clinic Settings'
    };

    // Check for specific patterns
    if (segments.includes('patient') && segments.length > 1) {
      return 'Patient Details';
    }

    if (segments.includes('doctor') && segments.length > 1) {
      return 'Doctor Profile';
    }

    // Return the route name or format the segment
    return routeNames[lastSegment] || lastSegment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }, [pathname]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return user?.email?.[0]?.toUpperCase() || 'U';

    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 flex h-16 items-center justify-between border-border border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60',
        className
      )}
    >
      {/* Left Section - Menu & Title */}
      <div className='flex items-center gap-4'>
        {showMenuButton && onMenuClick && (
          <Button
            aria-label='Toggle menu'
            className='lg:hidden'
            onClick={onMenuClick}
            size='icon'
            variant='ghost'
          >
            <Menu className='h-5 w-5' />
          </Button>
        )}

        <div className='flex flex-col'>
          <h1 className='font-semibold text-lg tracking-tight'>{formattedPath}</h1>

          {/* Optional: Add breadcrumb for deeper navigation */}
          {pathname && pathname.split('/').filter(Boolean).length > 1 && (
            <div className='flex items-center gap-1 text-muted-foreground text-xs'>
              <span>Home</span>
              {pathname
                .split('/')
                .filter(Boolean)
                .map((segment, index, array) => (
                  <span
                    className='flex items-center gap-1'
                    key={segment}
                  >
                    <span className='text-muted-foreground/50'>/</span>
                    <span className={cn(index === array.length - 1 && 'font-medium text-foreground')}>
                      {segment.replace(/-/g, ' ')}
                    </span>
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle Section - Search */}
      {showSearch && (
        <div className='mx-8 hidden max-w-md flex-1 md:block'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              className='w-full bg-background pl-9'
              placeholder='Search patients, appointments, reports...'
              type='search'
            />
          </div>
        </div>
      )}

      {/* Right Section - User & Notifications */}
      <div className='flex items-center gap-3'>
        {/* Notifications */}
        <div className='relative'>
          <Button
            aria-label='Notifications'
            className='relative'
            size='icon'
            variant='ghost'
          >
            <Bell className='h-5 w-5' />
            <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive font-bold text-[10px] text-destructive-foreground'>
              2
            </span>
          </Button>
        </div>

        {/* User Profile */}
        <div className='flex items-center gap-3'>
          <div className='hidden text-right sm:block'>
            <p className='max-w-[150px] truncate font-medium text-sm'>
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className='max-w-[150px] truncate text-muted-foreground text-xs'>
              {user?.role ? `${user.role}` : user?.email}
            </p>
          </div>

          <div className='relative'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-violet-500/20 font-semibold text-sm ring-2 ring-border'>
              {user?.image ? (
                <Image
                  alt={user.name || 'User'}
                  className='h-full w-full rounded-full object-cover'
                  height={36}
                  src={user.image}
                  width={36}
                />
              ) : (
                getUserInitials()
              )}
            </div>

            {/* Optional: Online status indicator */}
            {user?.role === 'ADMIN' && (
              <div className='absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500' />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Alternative: Simple Navbar for specific pages
export const SimpleNavbar = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const { user } = useAuth();

  return (
    <nav className='sticky top-0 z-50 flex h-16 items-center justify-between border-border border-b bg-background px-6'>
      <div>
        <h1 className='font-semibold text-lg'>{title}</h1>
        {subtitle && <p className='text-muted-foreground text-sm'>{subtitle}</p>}
      </div>

      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-violet-500/20 font-medium text-sm'>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </nav>
  );
};

// Utility function to format breadcrumbs (can be used elsewhere)
export const formatBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return [{ label: 'Dashboard', href: '/' }];

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const label = segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

    return { label, href };
  });

  return [{ label: 'Home', href: '/' }, ...breadcrumbs];
};
