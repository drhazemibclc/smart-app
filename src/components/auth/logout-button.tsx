'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client'; // Your Better Auth client instance

import { Button } from '../ui/button';

export const LogoutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  return (
    <Button
      className='bottom-0 w-fit gap-2 px-0 md:px-4'
      onClick={handleSignOut}
      variant={'outline'}
    >
      <LogOut />
      <span className='hidden lg:block'> Logout </span>{' '}
    </Button>
  );
};
