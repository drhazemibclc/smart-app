// src/app/dashboard/growth-charts/_components/client.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Baby, Plus, RefreshCw, Ruler, Trash2, Weight } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/utils/trpc';

import { toNumber } from '../../../../lib/decimal';
import type { MeasurementType } from '../../../../server/db/types';
import { calculateAge, getPercentileVariant } from '../../../../utils/formDate';
import { AddGrowthRecordModal } from './add-growth-record-modal';
import { GrowthStatsCards } from './growth-stats-cards';

// Define types locally to avoid import issues
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
}

type Gender = 'MALE' | 'FEMALE';

// Lazy load the chart renderer with correct typing
const GrowthChartRenderer = lazy(() =>
  import('./GrowthChartRenderer').then(mod => ({ default: mod.GrowthChartRenderer }))
);

interface GrowthChartsClientProps {
  patients: Patient[];
  clinicId: string;
}

// Define the expected shape of chart data
interface PercentileData {
  percentile: number;
  value: number;
}

interface ChartDataPoint {
  ageInMonths: number;
  value: number;
  zScore?: number;
  percentile?: number;
}

interface ChartResponse {
  measurements: ChartDataPoint[];
  percentiles: PercentileData[];
  percentileData: Array<{
    ageInMonths: number;
    [key: string]: number;
  }>;
}

const measurementTypes = [
  { value: 'Weight' as MeasurementType, label: 'Weight (kg)', icon: Weight, color: '#3b82f6' },
  { value: 'Height' as MeasurementType, label: 'Height (cm)', icon: Ruler, color: '#10b981' },
  { value: 'HeadCircumference' as MeasurementType, label: 'Head Circumference (cm)', icon: Baby, color: '#f59e0b' }
  // { value: 'BMI' as MeasurementType, label: 'BMI', icon: Activity, color: '#8b5cf6' }
];

export function GrowthChartsClient({ patients, clinicId }: GrowthChartsClientProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('Weight');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientGender = (selectedPatient?.gender?.toUpperCase() as Gender) || 'MALE';

  // Fetch growth data with WHO standards
  const { data: chartData, isLoading: chartLoading } = useQuery({
    ...trpc.growth.getPatientZScoreChart.queryOptions({
      patientId: selectedPatientId,
      measurementType,
      clinicId
    }),
    enabled: !!selectedPatientId
  });

  // Fetch growth records
  const { data: records, isLoading: recordsLoading } = useQuery({
    ...trpc.growth.getGrowthRecordsByPatient.queryOptions({
      patientId: selectedPatientId,
      limit: 10,
      clinicId
    }),
    enabled: !!selectedPatientId
  });

  // Fetch summary stats
  const { data: summary } = useQuery({
    ...trpc.growth.getGrowthSummary.queryOptions({
      patientId: selectedPatientId,
      clinicId
    }),
    enabled: !!selectedPatientId
  });

  // Delete mutation
  const deleteRecord = useMutation({
    mutationFn: async (recordId: string) => {
      return await fetch('/api/trpc/growth.deleteGrowthRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast.success('Record deleted successfully');
      queryClient.invalidateQueries({
        queryKey: trpc.growth.getGrowthRecordsByPatient.queryKey({ patientId: selectedPatientId })
      });
      queryClient.invalidateQueries({
        queryKey: trpc.growth.getPatientZScoreChart.queryKey({ patientId: selectedPatientId, measurementType })
      });
      queryClient.invalidateQueries({
        queryKey: trpc.growth.getGrowthSummary.queryKey({ patientId: selectedPatientId })
      });
    },
    onError: () => {
      toast.error('Failed to delete record');
    }
  });

  const handleDelete = (recordId: string) => {
    if (confirm('Are you sure you want to delete this growth record?')) {
      deleteRecord.mutate(recordId);
    }
  };

  // Type-safe data extraction with fallbacks
  const typedChartData = chartData as ChartResponse | undefined;
  const percentileLines = typedChartData?.percentiles || [];
  const patientMeasurements = typedChartData?.measurements || [];
  const percentileData = typedChartData?.percentileData || [];

  return (
    <div className='container mx-auto max-w-7xl space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl'>Growth Charts</h1>
          <p className='text-muted-foreground'>Track and analyze pediatric growth patterns with WHO standards</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Measurement
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <label
                className='block font-medium text-sm'
                htmlFor='patient-select'
              >
                Select Patient
              </label>
              <Select
                onValueChange={value => setSelectedPatientId(value)}
                value={selectedPatientId}
              >
                <SelectTrigger id='patient-select'>
                  <SelectValue placeholder='Choose a patient' />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.lastName}, {patient.firstName}
                      {patient.dateOfBirth && ` (${format(new Date(patient.dateOfBirth), 'yyyy')})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label
                className='block font-medium text-sm'
                htmlFor='measurement-type'
              >
                Measurement Type
              </label>
              <Select
                onValueChange={(value: MeasurementType) => setMeasurementType(value)}
                value={measurementType}
              >
                <SelectTrigger id='measurement-type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {measurementTypes.map(type => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                    >
                      <div className='flex items-center gap-2'>
                        <type.icon className='h-4 w-4' />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-end'>
              <Button
                className='w-full'
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: trpc.growth.getPatientZScoreChart.queryKey({
                      patientId: selectedPatientId,
                      measurementType
                    })
                  });
                }}
                variant='outline'
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Refresh Chart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {selectedPatient && summary && (
        <GrowthStatsCards
          patientAge={
            selectedPatient.dateOfBirth ? String(calculateAge(new Date(selectedPatient.dateOfBirth))) : undefined
          }
          summary={summary}
        />
      )}

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>
              {measurementTypes.find(t => t.value === measurementType)?.label} - Growth Chart
              {selectedPatient && ` for ${selectedPatient.firstName} ${selectedPatient.lastName}`}
            </span>
            {patientGender && (
              <Badge variant='outline'>{patientGender === 'MALE' ? '♂ Male' : '♀ Female'} (WHO Standards)</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <Skeleton className='h-[400px] w-full' />
          ) : patientMeasurements.length > 0 ? (
            <div className='h-[400px] w-full'>
              <Suspense fallback={<Skeleton className='h-[400px] w-full' />}>
                <GrowthChartRenderer
                  data={patientMeasurements}
                  gender={patientGender}
                  measurementType={measurementType}
                  measurementTypes={measurementTypes}
                  patientName={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : ''}
                  percentileData={percentileData}
                  percentiles={percentileLines}
                />
              </Suspense>
            </div>
          ) : (
            <div className='flex h-[400px] items-center justify-center'>
              <p className='text-muted-foreground'>No growth records found for this patient</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Growth Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Growth Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <Skeleton className='h-[200px] w-full' />
          ) : records && records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Height (cm)</TableHead>
                  <TableHead>Head Circ. (cm)</TableHead>
                  <TableHead>BMI</TableHead>
                  <TableHead>Z-Score</TableHead>
                  <TableHead>Percentile</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{record.ageMonths} months</TableCell>
                    <TableCell>{record.weight?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell>{record.height?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell>{record.headCircumference?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell>{record.bmi?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell>{record.zScore?.toFixed(2) ?? '-'}</TableCell>
                    <TableCell>
                      {record.percentile ? (
                        <Badge variant={getPercentileVariant(Number(record.percentile))}>
                          {toNumber(record.percentile)}th
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        disabled={deleteRecord.isPending}
                        onClick={() => handleDelete(record.id)}
                        size='sm'
                        variant='ghost'
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className='text-muted-foreground'>No growth records found</p>
          )}
        </CardContent>
      </Card>

      {/* Add Growth Record Modal */}
      <AddGrowthRecordModal
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: trpc.growth.getGrowthRecordsByPatient.queryKey({ patientId: selectedPatientId })
          });
          queryClient.invalidateQueries({
            queryKey: trpc.growth.getPatientZScoreChart.queryKey({ patientId: selectedPatientId, measurementType })
          });
          queryClient.invalidateQueries({
            queryKey: trpc.growth.getGrowthSummary.queryKey({ patientId: selectedPatientId })
          });
        }}
        open={isAddModalOpen}
        patientId={selectedPatientId}
        patients={patients.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName }))}
      />
    </div>
  );
}
