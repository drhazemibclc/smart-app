import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';

import '../styles/globals.css';

import Header from '@/components/header';
import Footer from '@/components/layout/footer';
import Providers from '@/components/providers';

import { geistMono, geistSans } from '../styles/fonts';

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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <div className='relative flex min-h-screen flex-col'>
            <Header />
            <main className='flex-1'>{children}</main>
            <Footer />
          </div>

          {/* Local analytics - works in all environments */}
          <Suspense fallback={null} />
        </Providers>
      </body>
    </html>
  );
}
