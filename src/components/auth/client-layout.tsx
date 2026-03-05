// components/auth/client-layout.tsx
'use client';

import { Toaster } from 'sonner';

import { AuthProvider } from './auth-provider';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        closeButton
        expand={false}
        position='top-center'
        richColors
        toastOptions={{
          duration: 4000,
          className: 'font-sans'
        }}
      />
    </AuthProvider>
  );
}
