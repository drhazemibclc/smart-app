// src/modules/billing/components/revenue-chart.tsx
'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatCurrency } from '@/utils/bill';

interface RevenueChartProps {
  data: Array<{
    month: string;
    cash: number;
    card: number;
    mobile: number;
    total: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className='h-80'>
      <ResponsiveContainer
        height='100%'
        width='100%'
      >
        <BarChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='month' />
          <YAxis tickFormatter={value => formatCurrency(value)} />
          <Tooltip
            formatter={(value: unknown) => {
              if (typeof value === 'number') {
                return formatCurrency(value);
              }
              if (typeof value === 'string') {
                const numValue = Number.parseFloat(value);
                return !Number.isNaN(numValue) ? formatCurrency(numValue) : '0';
              }
              return '0';
            }}
            labelStyle={{ color: 'black' }}
          />
          <Legend />
          <Bar
            dataKey='cash'
            fill='#10b981'
            name='Cash'
          />
          <Bar
            dataKey='card'
            fill='#3b82f6'
            name='Card'
          />
          <Bar
            dataKey='mobile'
            fill='#8b5cf6'
            name='Mobile'
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
