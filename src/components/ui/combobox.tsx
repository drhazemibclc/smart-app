'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ComboboxProps {
  options: { label: string; value: string }[];
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  multiple = false,
  className
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const handleSelect = (currentValue: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(currentValue)
        ? selectedValues.filter(v => v !== currentValue)
        : [...selectedValues, currentValue];
      onValueChange(newValue);
    } else {
      onValueChange(currentValue);
      setOpen(false);
    }
  };

  return (
    <Popover
      onOpenChange={setOpen}
      open={open}
    >
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn('h-auto min-h-10 w-full justify-between px-3', className)}
          role='combobox'
          variant='outline'
        >
          <div className='flex flex-wrap gap-1'>
            {selectedValues.length > 0 ? (
              multiple ? (
                selectedValues.map(v => (
                  <Badge
                    className='mr-1'
                    key={v}
                    variant='secondary'
                  >
                    {options.find(opt => opt.value === v)?.label}
                    <X
                      className='ml-1 h-3 w-3 cursor-pointer'
                      onClick={e => {
                        e.stopPropagation();
                        handleSelect(v);
                      }}
                    />
                  </Badge>
                ))
              ) : (
                options.find(opt => opt.value === selectedValues[0])?.label
              )
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
        <Command className='rounded-lg border shadow-md'>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  value={option.value}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0')}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
