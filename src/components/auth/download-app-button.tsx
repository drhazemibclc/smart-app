'use client';

import { Download } from 'lucide-react';
import Link from 'next/link';

interface DownloadAppButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function DownloadAppButton({ href = '#', label = 'Download App', className = '' }: DownloadAppButtonProps) {
  return (
    <Link
      className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-3 font-medium text-white shadow-lg shadow-sky-400/25 transition-all hover:shadow-sky-400/30 hover:shadow-xl ${className}`}
      href={href}
    >
      <Download
        className='h-5 w-5'
        size={20}
      />
      {label}
    </Link>
  );
}
