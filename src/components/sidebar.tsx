import {
  Bell,
  LayoutDashboard,
  List,
  ListOrdered,
  Logs,
  type LucideIcon,
  Pill,
  Receipt,
  Settings,
  SquareActivity,
  User,
  UserRound,
  Users,
  UsersRound
} from 'lucide-react';
import Link from 'next/link';

import { getRole } from '../lib/auth-server';
import { LogoutButton } from './auth/logout-button';

// Access levels - using lowercase for consistency with auth-server
const ACCESS_LEVELS_ALL = ['admin', 'doctor', 'staff', 'patient'];

const SidebarIcon = ({ icon: Icon }: { icon: LucideIcon }) => {
  return <Icon className='size-6 lg:size-5' />;
};

export const Sidebar = async () => {
  // Get session and role - both awaited in Next.js 16
  // const session = await getSession();
  const role = await getRole();

  // Role is already lowercase from getRole()
  const normalizedRole = role;

  // Define sidebar links with proper typing
  type SidebarLink = {
    name: string;
    href: string;
    access: string[];
    icon: LucideIcon;
  };

  type SidebarSection = {
    label: string;
    links: SidebarLink[];
  };

  const SIDEBAR_LINKS: SidebarSection[] = [
    {
      label: 'MENU',
      links: [
        {
          name: 'Dashboard',
          href: '/',
          access: ACCESS_LEVELS_ALL,
          icon: LayoutDashboard
        },
        {
          name: 'Profile',
          href: '/patient/self',
          access: ['patient'],
          icon: User
        }
      ]
    },
    {
      label: 'Manage',
      links: [
        {
          name: 'Users',
          href: '/record/users',
          access: ['admin'],
          icon: Users
        },
        {
          name: 'Doctors',
          href: '/record/doctors',
          access: ['admin'],
          icon: User
        },
        {
          name: 'Staffs',
          href: '/record/staffs',
          access: ['admin', 'doctor'],
          icon: UserRound
        },
        {
          name: 'Patients',
          href: '/record/patients',
          access: ['admin', 'doctor', 'staff'],
          icon: UsersRound
        },
        {
          name: 'Appointments',
          href: '/record/appointments',
          access: ['admin', 'doctor', 'staff'],
          icon: ListOrdered
        },
        {
          name: 'Medical Records',
          href: '/record/medical-records',
          access: ['admin', 'doctor', 'staff'],
          icon: SquareActivity
        },
        {
          name: 'Billing Overview',
          href: '/record/billing',
          access: ['admin', 'doctor'],
          icon: Receipt
        },
        {
          name: 'Patient Management',
          href: '/nurse/patient-management',
          access: ['staff'],
          icon: Users
        },
        {
          name: 'Administer Medications',
          href: '/nurse/administer-medications',
          access: ['admin', 'doctor', 'staff'],
          icon: Pill
        },
        {
          name: 'Appointments',
          href: '/record/appointments',
          access: ['patient'],
          icon: ListOrdered
        },
        {
          name: 'Records',
          href: '/patient/self',
          access: ['patient'],
          icon: List
        },
        {
          name: 'Prescription',
          href: '#',
          access: ['patient'],
          icon: Pill
        },
        {
          name: 'Billing',
          href: '/patient/self?cat=payments',
          access: ['patient'],
          icon: Receipt
        }
      ]
    },
    {
      label: 'System',
      links: [
        {
          name: 'Notifications',
          href: '/notifications',
          access: ACCESS_LEVELS_ALL,
          icon: Bell
        },
        {
          name: 'Audit Logs',
          href: '/admin/audit-logs',
          access: ['admin'],
          icon: Logs
        },
        {
          name: 'Settings',
          href: '/admin/system-settings',
          access: ['admin'],
          icon: Settings
        }
      ]
    }
  ];

  // Filter links based on user role
  const filteredSections = SIDEBAR_LINKS.map(section => ({
    ...section,
    links: section.links.filter(link => normalizedRole && link.access.includes(normalizedRole))
  })).filter(section => section.links.length > 0);

  // If no role or no links, don't render sidebar
  if (!normalizedRole || filteredSections.length === 0) {
    return null;
  }

  return (
    <div className='flex min-h-full w-full flex-col justify-between gap-4 overflow-y-scroll bg-white p-4'>
      <div>
        <div className='flex items-center justify-center gap-2 lg:justify-start'>
          <div className='rounded-md bg-blue-600 p-1.5 text-white'>
            <SquareActivity size={22} />
          </div>
          <Link
            className='hidden font-bold text-base lg:flex 2xl:text-xl'
            href={'/'}
          >
            Kinda HMS
          </Link>
        </div>

        <div className='mt-4 text-sm'>
          {filteredSections.map(section => (
            <div
              className='flex flex-col gap-2'
              key={section.label}
            >
              <span className='my-4 hidden font-bold text-gray-400 uppercase lg:block'>{section.label}</span>

              {section.links.map(link => (
                <Link
                  className='flex items-center justify-center gap-4 rounded-md py-2 text-gray-500 hover:bg-blue-600/10 md:px-2 lg:justify-start'
                  href={link.href}
                  key={link.name}
                >
                  <SidebarIcon icon={link.icon} />
                  <span className='hidden lg:block'>{link.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <LogoutButton />
    </div>
  );
};
