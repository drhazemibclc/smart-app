'use client';

import { Bell, Menu, Search, User } from 'lucide-react';
import { useState } from 'react';

import { LogoHeader } from '@/components/branding/logo-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { Sidebar } from './sidebar';

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export function AppHeader({
  title,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  user
}: AppHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center gap-4 px-4'>
        {/* Mobile Menu Trigger */}
        <Sheet
          onOpenChange={setSidebarOpen}
          open={sidebarOpen}
        >
          <SheetTrigger asChild>
            <Button
              className='shrink-0 md:hidden'
              size='icon'
              variant='ghost'
            >
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            className='w-64 p-0'
            side='left'
          >
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className='hidden md:block'>
          <LogoHeader />
        </div>

        {/* Page Title */}
        {title && (
          <div className='flex-1 md:hidden'>
            <h1 className='font-semibold text-lg'>{title}</h1>
          </div>
        )}

        {/* Search */}
        {showSearch && (
          <div className='hidden max-w-md flex-1 md:flex'>
            <div className='relative w-full'>
              <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                className='bg-background pl-8'
                placeholder='Search patients, appointments...'
                type='search'
              />
            </div>
          </div>
        )}

        <div className='ml-auto flex items-center gap-2'>
          {/* Notifications */}
          {showNotifications && (
            <Button
              className='shrink-0'
              size='icon'
              variant='ghost'
            >
              <Bell className='h-4 w-4' />
              <span className='sr-only'>View notifications</span>
            </Button>
          )}

          {/* User Menu */}
          {showUserMenu && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className='shrink-0'
                  size='icon'
                  variant='ghost'
                >
                  <User className='h-4 w-4' />
                  <span className='sr-only'>User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='font-medium text-sm leading-none'>{user.name}</p>
                    <p className='text-muted-foreground text-xs leading-none'>{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

export function SimpleHeader() {
  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center gap-4 px-4'>
        <LogoHeader />
        <div className='flex-1' />
      </div>
    </header>
  );
}
