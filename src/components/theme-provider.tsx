'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type * as React from 'react';

type NextThemesProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true
}: {
  children: React.ReactNode;
  attribute?: NextThemesProps['attribute'];
  defaultTheme?: string;
  enableSystem?: boolean;
}) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      disableTransitionOnChange
      enableSystem={enableSystem}
    >
      {children}
    </NextThemesProvider>
  );
}
