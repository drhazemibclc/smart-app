'use client';

import { Activity, AlertTriangle, Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GrowthStatsCardsProps {
  summary: {
    lastMeasurement?: {
      weight?: number;
      height?: number;
      headCircumference?: number;
      bmi?: number;
      zScore?: number;
      percentile?: number;
    };
    velocity?: {
      weight?: number;
      height?: number;
      headCircumference?: number;
    };
    totalRecords: number;
  };
  patientAge?: string;
}

export function GrowthStatsCards({ summary, patientAge }: GrowthStatsCardsProps) {
  const { lastMeasurement, velocity, totalRecords } = summary;

  const getTrendIcon = (value?: number) => {
    if (!value) return <Minus className='h-4 w-4 text-gray-400' />;
    if (value > 0) return <TrendingUp className='h-4 w-4 text-green-500' />;
    if (value < 0) return <TrendingDown className='h-4 w-4 text-red-500' />;
    return <Minus className='h-4 w-4 text-gray-400' />;
  };

  const getPercentileStatus = (percentile?: number) => {
    if (!percentile) return 'normal';
    if (percentile < 5) return 'critical-low';
    if (percentile < 10) return 'low';
    if (percentile > 95) return 'critical-high';
    if (percentile > 90) return 'high';
    return 'normal';
  };

  const percentileStatus = getPercentileStatus(lastMeasurement?.percentile);

  return (
    <div className='grid gap-4 md:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='font-medium text-sm'>Latest Measurements</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>
            {lastMeasurement?.weight && (
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Weight:</span>
                <span className='font-medium'>{lastMeasurement.weight.toFixed(1)} kg</span>
              </div>
            )}
            {lastMeasurement?.height && (
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Height:</span>
                <span className='font-medium'>{lastMeasurement.height.toFixed(1)} cm</span>
              </div>
            )}
            {lastMeasurement?.headCircumference && (
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Head Circ.:</span>
                <span className='font-medium'>{lastMeasurement.headCircumference.toFixed(1)} cm</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='font-medium text-sm'>Z-Score / Percentile</CardTitle>
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              percentileStatus === 'critical-low' && 'bg-red-500',
              percentileStatus === 'low' && 'bg-yellow-500',
              percentileStatus === 'normal' && 'bg-green-500',
              percentileStatus === 'high' && 'bg-yellow-500',
              percentileStatus === 'critical-high' && 'bg-red-500'
            )}
          />
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>
            {lastMeasurement?.zScore && (
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Z-Score:</span>
                <span
                  className={cn(
                    'font-medium',
                    Math.abs(lastMeasurement.zScore) > 2 && 'text-red-500',
                    Math.abs(lastMeasurement.zScore) > 1 && 'text-yellow-500'
                  )}
                >
                  {lastMeasurement.zScore.toFixed(2)}
                </span>
              </div>
            )}
            {lastMeasurement?.percentile && (
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Percentile:</span>
                <span className='font-medium'>{lastMeasurement.percentile}th</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='font-medium text-sm'>Growth Velocity</CardTitle>
          <div className='flex gap-1'>
            {getTrendIcon(velocity?.weight)}
            {getTrendIcon(velocity?.height)}
            {getTrendIcon(velocity?.headCircumference)}
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>
            {velocity?.weight && (
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Weight:</span>
                <span className='font-medium'>
                  {velocity.weight > 0 ? '+' : ''}
                  {velocity.weight.toFixed(2)} kg/mo
                </span>
              </div>
            )}
            {velocity?.height && (
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Height:</span>
                <span className='font-medium'>
                  {velocity.height > 0 ? '+' : ''}
                  {velocity.height.toFixed(2)} cm/mo
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='font-medium text-sm'>Summary</CardTitle>
          {lastMeasurement?.percentile && lastMeasurement.percentile < 10 && (
            <AlertTriangle className='h-4 w-4 text-yellow-500' />
          )}
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>
            <div className='flex justify-between text-xs'>
              <span className='text-muted-foreground'>Total Records:</span>
              <span className='font-medium'>{totalRecords}</span>
            </div>
            {patientAge && (
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Age:</span>
                <span className='font-medium'>{patientAge}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
