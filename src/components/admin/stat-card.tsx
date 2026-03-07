import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Card, CardContent } from '../ui/card';

interface CardProps {
  title: string;
  icon: LucideIcon;
  note: string;
  value: number;
  className?: string;
  iconClassName?: string;
  link?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  onClick?: () => void;
}

// const CardIcon = ({ icon: Icon }: { icon: LucideIcon }) => {
//   return <Icon />;
// };

export function StatCard({
  title,
  value,
  icon: Icon,
  className,
  iconClassName,
  note,
  link,
  trend,
  onClick
}: CardProps) {
  const content = (
    <div
      className={cn(
        'min-w-[200px] flex-1',
        link && 'cursor-pointer transition-transform hover:scale-105',
        onClick && 'cursor-pointer'
      )}
      onClick={link ? undefined : onClick}
      role={onClick ? 'button' : undefined}
    >
      <Card className={cn('relative overflow-hidden', className)}>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <p className='font-medium text-muted-foreground text-sm'>{title}</p>
              <p className='font-bold text-2xl tracking-tight'>{value}</p>

              {/* Trend indicator */}
              {trend && (
                <div className='flex items-center gap-1 text-xs'>
                  <span className={cn('font-medium', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
                    {trend.isPositive ? '+' : '-'}
                    {Math.abs(trend.value)}%
                  </span>
                  {trend.label && <span className='text-muted-foreground'>{trend.label}</span>}
                </div>
              )}

              {/* Note */}
              {note && <p className='text-muted-foreground text-xs'>{note}</p>}
            </div>

            {/* Icon */}
            <div className={cn('rounded-full p-3', iconClassName || 'bg-primary/10 text-primary')}>
              <Icon className='h-5 w-5' />
            </div>
          </div>
        </CardContent>

        {/* Decorative gradient overlay */}
        <div className='absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-black/5' />
      </Card>
    </div>
  );

  if (link) {
    return (
      <Link
        className='min-w-[200px] flex-1'
        href={link}
      >
        {content}
      </Link>
    );
  }

  return content;
}

// Optional: Export a skeleton version for loading states
export function StatCardSkeleton() {
  return (
    <Card className='min-w-[200px]'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-3'>
            <div className='h-4 w-20 animate-pulse rounded bg-muted' />
            <div className='h-8 w-24 animate-pulse rounded bg-muted' />
            <div className='h-3 w-16 animate-pulse rounded bg-muted' />
          </div>
          <div className='h-12 w-12 animate-pulse rounded-full bg-muted' />
        </div>
      </CardContent>
    </Card>
  );
}
