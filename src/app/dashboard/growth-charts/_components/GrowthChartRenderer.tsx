// src/app/dashboard/growth-charts/_components/GrowthChartRenderer.tsx
'use client';

import type { LucideIcon } from 'lucide-react';
import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { MeasurementType } from '@/server/db/types';

import { GrowthChartTooltip } from './growth-chart-tooltip';

interface PercentileData {
  percentile: number;
  value: number;
}

interface GrowthChartRendererProps {
  data: Array<{
    ageInMonths: number;
    value: number;
    zScore?: number;
    percentile?: number;
  }>;
  measurementType: MeasurementType;
  measurementTypes: Array<{ value: MeasurementType; label: string; icon: LucideIcon; color: string }>;
  patientName: string;
  gender: string;
  percentiles: PercentileData[];
  percentileData: Array<{
    ageInMonths: number;
    [key: string]: number;
  }>;
}

export function GrowthChartRenderer({
  data,
  measurementType,
  measurementTypes,
  percentiles,
  percentileData
}: GrowthChartRendererProps) {
  return (
    <ResponsiveContainer
      height='100%'
      width='100%'
    >
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey='ageInMonths'
          domain={[0, 60]}
          label={{ value: 'Age (months)', position: 'insideBottom', offset: -5 }}
          type='number'
        />
        <YAxis
          label={{
            value: getYAxisLabel(measurementType),
            angle: -90,
            position: 'insideLeft'
          }}
        />
        <Tooltip content={<GrowthChartTooltip measurementType={measurementType} />} />
        <Legend />

        {/* WHO Percentile Lines */}
        {percentiles.map((percentile, index) => (
          <Line
            data={percentileData}
            dataKey={`p${percentile.percentile}`}
            dot={false}
            key={`percentile-${percentile.percentile}`}
            name={`${percentile.percentile}th percentile`}
            stroke={`rgba(156, 163, 175, ${0.3 + index * 0.1})`}
            strokeDasharray='5 5'
            strokeWidth={1}
            type='monotone'
          />
        ))}

        {/* Patient Measurements */}
        <Line
          activeDot={{ r: 8 }}
          data={data}
          dataKey='value'
          dot={{ r: 6, fill: '#3b82f6' }}
          name='Patient'
          stroke={measurementTypes.find(t => t.value === measurementType)?.color || '#3b82f6'}
          strokeWidth={3}
          type='monotone'
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function getYAxisLabel(type: MeasurementType): string {
  switch (type) {
    case 'Weight':
      return 'Weight (kg)';
    case 'Height':
      return 'Height (cm)';
    case 'HeadCircumference':
      return 'Head Circumference (cm)';
    default:
      return '';
  }
}
