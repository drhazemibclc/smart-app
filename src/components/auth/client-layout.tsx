// components/auth/client-layout.tsx
'use client';

import { Toaster } from 'sonner';

import { AuthProvider } from '../provider/auth-provider';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider auth={null}>
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
