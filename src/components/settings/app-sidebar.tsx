'use client';

import { CalendarDays, LayoutDashboard, LogOut, Stethoscope, UsersRound } from 'lucide-react';
import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Appointments', url: '/dashboard/appointments', icon: CalendarDays },
  { title: 'Doctors', url: '/dashboard/doctors', icon: Stethoscope },
  { title: 'Patients', url: '/dashboard/patients', icon: UsersRound }
] as const;

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push('/sign-in')
      }
    });
  };

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className='border-b p-4'>
        <Link href='/'>
          <Image
            alt='Clinic Logo'
            className='block dark:hidden'
            src='/logo.svg'
            width={136}
          />
          <Image
            alt='Clinic Logo'
            className='hidden dark:block'
            height={28}
            src='/logo-dark.svg'
            width={136}
          />
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url as Route}>
                      <item.icon className='h-4 w-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer / User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size='lg'>
                  <Avatar>
                    <AvatarFallback>{session.data?.user?.name?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className='text-left'>
                    <p className='font-medium text-sm'>{session.data?.user?.clinic?.name ?? 'Clinic'}</p>
                    <p className='text-muted-foreground text-sm'>{session.data?.user?.email}</p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className='mr-2 h-4 w-4' />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
