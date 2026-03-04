import type { PropsWithChildren } from 'react';
import { Suspense } from 'react';

import { AuthProvider } from '@/components/provider/auth-provider';
import ThemeProvider from '@/components/theme-provider';

import { ThemeProviderWrapper } from './toast-container';
import TrpcProvider from './trpc-provider';

type TRootProvider = PropsWithChildren;

function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthProvider auth={{ user: null, session: null }}>{children}</AuthProvider>
    </Suspense>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ThemeProvider>{children}</ThemeProvider>
    </Suspense>
  );
}

export default function RootProvider({ children }: Readonly<TRootProvider>) {
  return (
    <TrpcProvider>
      <AuthProviderWrapper>
        <ThemeWrapper>
          {children}
          <ThemeProviderWrapper>{null}</ThemeProviderWrapper>
        </ThemeWrapper>
      </AuthProviderWrapper>
    </TrpcProvider>
  );
}
