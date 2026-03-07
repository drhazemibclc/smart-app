import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';

type RenderInputProps<T extends FieldValues> = {
  field: ControllerRenderProps<T>;
  type: 'input' | 'select' | 'checkbox' | 'switch' | 'radio' | 'textarea';
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password' | 'date';
  selectList?: { label: string; value: string }[];
  defaultValue?: string;
};

export const RenderInput = <T extends FieldValues>({
  field,
  type,
  placeholder,
  inputType = 'text',
  selectList,
  defaultValue
}: RenderInputProps<T>) => {
  switch (type) {
    case 'input':
      return (
        <input
          {...field}
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          defaultValue={defaultValue}
          placeholder={placeholder}
          type={inputType}
        />
      );

    case 'textarea':
      return (
        <textarea
          {...field}
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          defaultValue={defaultValue}
          placeholder={placeholder}
        />
      );

    case 'select':
      return (
        <select
          {...field}
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          defaultValue={defaultValue ?? ''}
        >
          {selectList?.map(opt => (
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'checkbox':
    case 'switch':
      return (
        <input
          {...field}
          checked={field.value as boolean}
          className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500'
          type='checkbox'
        />
      );

    case 'radio':
      return (
        <input
          {...field}
          checked={field.value === defaultValue}
          className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500'
          type='radio'
          value={defaultValue}
        />
      );

    default:
      return null;
  }
};
