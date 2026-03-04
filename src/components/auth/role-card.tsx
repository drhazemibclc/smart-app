import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

import type { RoleOption } from './types';

interface RoleCardProps {
  role: RoleOption;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role }) => {
  return (
    <Link
      className='group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-cyan-500'
      href={{ pathname: role.href }}
    >
      {/* Decorative Background Blob */}
      <div
        className={`absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 bg-linear-to-br ${role.primaryColor} rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20 dark:opacity-20 dark:group-hover:opacity-30`}
      />

      <div className='relative z-10 flex flex-1 flex-col'>
        <div
          className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br ${role.primaryColor} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
        >
          {role.visualIcon}
        </div>

        <h3 className='mb-2 font-bold text-2xl text-slate-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-cyan-400'>
          {role.title}
        </h3>

        <p className='mb-8 text-slate-500 leading-relaxed dark:text-slate-400'>{role.description}</p>

        <div className='mb-8 flex-1 space-y-3'>
          {role.features.map(feature => (
            <div
              className='flex items-start gap-3'
              key={feature.text}
            >
              <div className='mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400'>
                <CheckCircle2 size={18} />
              </div>
              <span className='font-medium text-slate-600 text-sm dark:text-slate-300'>{feature.text}</span>
            </div>
          ))}
        </div>

        <div className='mt-auto'>
          <div className='flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-cyan-800 px-4 py-3 text-center font-semibold text-white transition-all duration-300 group-hover:border-brand-600 group-hover:bg-cyan-900 group-hover:text-white dark:border-slate-600 dark:bg-cyan-700 dark:group-hover:border-cyan-500 dark:group-hover:bg-cyan-600'>
            {role.buttonText}
            <ArrowRight
              className='transition-transform group-hover:translate-x-1'
              size={18}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};
