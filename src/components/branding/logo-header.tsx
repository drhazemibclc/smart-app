'use client';

import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function LogoHeader() {
  return (
    <Link
      className='group relative flex items-center gap-3 transition-transform hover:scale-105'
      href='/'
    >
      {/* Background Glow */}
      <div className='absolute inset-0 rounded-full bg-blue-400/20 blur-xl transition-opacity group-hover:opacity-100' />

      {/* Logo */}
      <div className='relative flex h-12 w-12 items-center justify-center'>
        <Image
          alt='Smart Clinic Logo'
          className='object-contain'
          height={48}
          priority
          src='/logo.svg'
          width={48}
        />
      </div>

      {/* Brand Text */}
      <div className='flex flex-col'>
        <h1 className='bg-linear-to-r from-blue-700 to-cyan-600 bg-clip-text font-black text-transparent text-xl tracking-tighter'>
          Smart Clinic
        </h1>
        <span className='font-semibold text-[10px] text-blue-600 uppercase tracking-[0.2em] opacity-90'>
          Pediatrics
        </span>
      </div>

      {/* Sparkle Icon */}
      <Sparkles className='h-4 w-4 text-blue-500 opacity-70' />
    </Link>
  );
}

export function LogoHeaderMinimal() {
  return (
    <Link
      className='group relative flex items-center gap-2 transition-transform hover:scale-105'
      href='/'
    >
      {/* Logo Only */}
      <div className='relative flex h-8 w-8 items-center justify-center'>
        <Image
          alt='Smart Clinic Logo'
          className='object-contain'
          height={32}
          priority
          src='/logo.svg'
          width={32}
        />
      </div>

      {/* Text Only */}
      <div className='hidden sm:block'>
        <h1 className='bg-linear-to-r from-blue-700 to-cyan-600 bg-clip-text font-black text-lg text-transparent tracking-tighter'>
          Smart Clinic
        </h1>
      </div>
    </Link>
  );
}

export function LogoHeaderCompact() {
  return (
    <Link
      className='group relative flex items-center justify-center transition-transform hover:scale-105'
      href='/'
    >
      <div className='relative flex h-10 w-10 items-center justify-center'>
        <Image
          alt='Smart Clinic Logo'
          className='object-contain'
          height={40}
          priority
          src='/logo.svg'
          width={40}
        />
        <div className='absolute -right-1 -bottom-1 rounded-full bg-blue-500 p-1'>
          <Sparkles className='h-3 w-3 text-white' />
        </div>
      </div>
    </Link>
  );
}
