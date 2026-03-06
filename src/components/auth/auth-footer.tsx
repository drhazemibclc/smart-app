'use client';

import Link from 'next/link';
import { memo } from 'react';

// Simple memoized year - will only compute once
const CURRENT_YEAR = new Date().getFullYear();

export const AuthFooter = memo(function AuthFooter() {
  return (
    <footer className='py-6 text-center text-slate-400 text-sm dark:text-slate-600'>
      © {CURRENT_YEAR} StarterKit. MIT License.{' '}
      <Link
        className='text-brand-600 hover:underline dark:text-cyan-400'
        href='/privacy'
      >
        Privacy Policy
      </Link>
    </footer>
  );
});
// 'use client';

// import { cacheLife } from 'next/cache';
// import Link from 'next/link';
// import { use } from 'react';

// // Cache the year promise with proper revalidation
// const getCurrentYear = async () => {
//   'use cache';
//   cacheLife({
//     stale: 86400, // 1 day in seconds
//     revalidate: 2592000, // 30 days in seconds
//     expire: 31536000 // 1 year in seconds
//   });

//   return new Date().getFullYear();
// };

// // Create a stable promise that will be reused across renders
// const currentYearPromise = getCurrentYear();

// export function AuthFooter() {
//   // use() hook unwraps the promise in a Client Component
//   const year = use(currentYearPromise);

//   return (
//     <footer className='py-6 text-center text-slate-400 text-sm dark:text-slate-600'>
//       © {year} StarterKit. MIT License.{' '}
//       <Link
//         className='text-brand-600 hover:underline dark:text-cyan-400'
//         href='/privacy'
//       >
//         Privacy Policy
//       </Link>
//     </footer>
//   );
// }
