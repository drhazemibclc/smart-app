'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

import { TooltipProvider } from '@/components/ui/tooltip';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <TooltipProvider>
      {children}
      <Toaster
        closeButton
        position='top-right'
        richColors
        theme={resolvedTheme as 'light' | 'dark' | 'system'}
      />
    </TooltipProvider>
  );
}
