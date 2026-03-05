'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PrescriptionFiltersProps {
  initialStatus?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function PrescriptionFilters({ initialStatus, initialStartDate, initialEndDate }: PrescriptionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(initialStatus ?? 'all');
  const [startDate, setStartDate] = useState(initialStartDate ?? '');
  const [endDate, setEndDate] = useState(initialEndDate ?? '');

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (status && status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }

    if (startDate) {
      params.set('startDate', startDate);
    } else {
      params.delete('startDate');
    }

    if (endDate) {
      params.set('endDate', endDate);
    } else {
      params.delete('endDate');
    }

    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setStatus('all');
    setStartDate('');
    setEndDate('');

    router.push(pathname);
  };

  return (
    <div className='flex flex-wrap items-end gap-4'>
      {/* Status */}
      <div className='space-y-2'>
        <label
          className='font-medium text-sm'
          htmlFor='status'
        >
          Status
        </label>

        <Select
          onValueChange={setStatus}
          value={status}
        >
          <SelectTrigger
            className='w-[180px]'
            id='status'
          >
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div className='space-y-2'>
        <label
          className='font-medium text-sm'
          htmlFor='startDate'
        >
          From Date
        </label>

        <Input
          className='w-[180px]'
          id='startDate'
          onChange={e => setStartDate(e.target.value)}
          type='date'
          value={startDate}
        />
      </div>

      {/* End Date */}
      <div className='space-y-2'>
        <label
          className='font-medium text-sm'
          htmlFor='endDate'
        >
          To Date
        </label>

        <Input
          className='w-[180px]'
          id='endDate'
          onChange={e => setEndDate(e.target.value)}
          type='date'
          value={endDate}
        />
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <Button onClick={applyFilters}>
          <Search className='mr-2 h-4 w-4' />
          Apply Filters
        </Button>

        <Button
          onClick={clearFilters}
          variant='outline'
        >
          <X className='mr-2 h-4 w-4' />
          Clear
        </Button>
      </div>
    </div>
  );
}
