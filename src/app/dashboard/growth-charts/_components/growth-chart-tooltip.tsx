'use client';

import { Card } from '@/components/ui/card';

interface TooltipPayload {
  color?: string;
  dataKey?: string;
  name?: string;
  value?: number;
  payload: {
    zScore?: number;
    percentiles?: Array<{
      percentile: number;
      value: number;
    }>;
  };
}

interface GrowthChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number | string;
  measurementType: string;
}

export function GrowthChartTooltip({ active, payload, label, measurementType }: GrowthChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const getUnit = (type: string) => {
    switch (type) {
      case 'WEIGHT':
        return 'kg';
      case 'HEIGHT':
        return 'cm';
      case 'HEAD_CIRCUMFERENCE':
        return 'cm';
      default:
        return '';
    }
  };

  const unit = getUnit(measurementType);

  return (
    <Card className='p-3'>
      <p className='mb-2 font-medium text-sm'>Age: {label} months</p>
      {payload.map((entry, index) => {
        if (entry.dataKey === 'value') {
          return (
            <p
              className='text-sm'
              key={entry.dataKey}
              style={{ color: entry.color }}
            >
              Patient: {entry.value?.toFixed(2)} {unit}
              {entry.payload.zScore && ` (Z=${entry.payload.zScore.toFixed(2)})`}
            </p>
          );
        }
        if (entry.dataKey?.startsWith('percentiles')) {
          const percentile = entry.payload.percentiles?.[index]?.percentile;
          return (
            <p
              className='text-gray-500 text-xs'
              key={entry.value}
            >
              {percentile}th percentile: {entry.value?.toFixed(2)} {unit}
            </p>
          );
        }
        return null;
      })}
    </Card>
  );
}
