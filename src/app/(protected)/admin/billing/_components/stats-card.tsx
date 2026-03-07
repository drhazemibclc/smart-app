// src/modules/billing/components/stats-cards.tsx
'use client';

import { AlertCircle, CreditCard, DollarSign, TrendingUp } from 'lucide-react';

import { StatCard, StatCardSkeleton } from '@/components/admin/stat-card';

interface StatsCardsProps {
  stats?: {
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
    paidCount: number;
    collectionRate: number | string;
    previousPeriodRevenue?: number; // Optional for trend
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  // Calculate trend if previous period data is available
  const revenueTrend = stats.previousPeriodRevenue
    ? {
        value: ((stats.totalRevenue - stats.previousPeriodRevenue) / stats.previousPeriodRevenue) * 100,
        isPositive: stats.totalRevenue > stats.previousPeriodRevenue,
        label: 'vs last month'
      }
    : undefined;

  const cards = [
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      icon: DollarSign,
      className: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20',
      iconClassName: 'bg-green-600 text-white',
      note: 'Last 30 days',
      trend: revenueTrend,
      link: '/billing/reports'
    },
    {
      title: 'Collected',
      value: stats.totalPaid,
      icon: TrendingUp,
      className: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
      iconClassName: 'bg-blue-600 text-white',
      note: `${stats.paidCount} payments`,
      link: '/billing?status=PAID'
    },
    {
      title: 'Pending',
      value: stats.totalPending,
      icon: CreditCard,
      className: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20',
      iconClassName: 'bg-yellow-600 text-white',
      note: 'Awaiting payment',
      link: '/billing?status=UNPAID'
    },
    {
      title: 'Collection Rate',
      value: typeof stats.collectionRate === 'number' ? stats.collectionRate : 0,
      icon: AlertCircle,
      className: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20',
      iconClassName: 'bg-purple-600 text-white',
      note: 'Last 30 days',
      link: '/billing/analytics'
    }
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card, index) => (
        <StatCard
          className={card.className}
          icon={card.icon}
          iconClassName={card.iconClassName}
          key={index}
          link={card.link}
          note={card.note}
          title={card.title}
          trend={card.trend}
          value={card.value}
        />
      ))}
    </div>
  );
}

// Loading skeleton for stats cards
export function StatsCardsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {[1, 2, 3, 4].map(i => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
