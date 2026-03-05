import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';

import '../styles/globals.css';

import Footer from '@/components/footer';
import Providers from '@/components/providers';
import { geistMono, geistSans } from '@/styles/fonts';
import { HydrateClient } from '@/trpc/server';

export const metadata: Metadata = {
  title: {
    template: '%s | Pediatric Clinic',
    default: 'Pediatric Clinic - Expert Care for Children'
  },
  description: "Comprehensive pediatric care for your child's health and development",
  keywords: ['pediatric clinic', 'children health', 'pediatrician', 'child care', 'vaccinations'],
  authors: [{ name: 'Pediatric Clinic' }],
  creator: 'Pediatric Clinic',
  publisher: 'Pediatric Clinic',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Pediatric Clinic',
    description: 'Expert pediatric care for your child',
    url: '/',
    siteName: 'Pediatric Clinic',
    locale: 'en_US',
    type: 'website'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ]
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Temporarily disable all prefetching to isolate homepage issue
  // Prefetch common data that will be used across the app
  // This will be available in the HydrateClient
  // void prefetch(trpc.health.healthCheck.queryOptions());

  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-white text-gray-900 antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <HydrateClient>{children}</HydrateClient>
        </Providers>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
