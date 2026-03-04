// apps/web/src/app/(dashboard)/appointments/components/appointment-filters.tsx
'use client';

import { format } from 'date-fns';
import { CalendarIcon, Filter, Search, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppointmentStatus } from '@/db/types';
import { cn } from '@/lib/utils';

interface AppointmentFiltersProps {
  onDateChange: (date: Date) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AppointmentStatus | 'all') => void;
  search: string;
  selectedDate: Date;
  status: AppointmentStatus | 'all';
  view: 'list' | 'calendar';
}

export function AppointmentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  selectedDate,
  onDateChange,
  view
}: AppointmentFiltersProps) {
  const [dateOpen, setDateOpen] = React.useState(false);

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {/* Search */}
      <div className='relative w-full sm:w-64'>
        <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
        <Input
          className='pl-8'
          onChange={e => onSearchChange(e.target.value)}
          placeholder='Search patients...'
          value={search}
        />
        {search && (
          <Button
            className='absolute top-1 right-1 h-7 w-7 p-0'
            onClick={() => onSearchChange('')}
            size='sm'
            variant='ghost'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <Select
        onValueChange={onStatusChange}
        value={status}
      >
        <SelectTrigger className='w-[140px]'>
          <Filter className='mr-2 h-4 w-4' />
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All</SelectItem>
          <SelectItem value='SCHEDULED'>Scheduled</SelectItem>
          <SelectItem value='CHECKED_IN'>Checked In</SelectItem>
          <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
          <SelectItem value='COMPLETED'>Completed</SelectItem>
          <SelectItem value='CANCELLED'>Cancelled</SelectItem>
          <SelectItem value='NO_SHOW'>No Show</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Filter (only for list view) */}
      {view === 'list' && (
        <Popover
          onOpenChange={setDateOpen}
          open={dateOpen}
        >
          <PopoverTrigger asChild>
            <Button
              className={cn('w-[200px] justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}
              variant='outline'
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              initialFocus
              mode='single'
              onSelect={date => {
                if (date) {
                  onDateChange(date);
                  setDateOpen(false);
                }
              }}
              selected={selectedDate}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
