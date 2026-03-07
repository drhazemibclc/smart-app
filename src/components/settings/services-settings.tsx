'use client';

import { useQuery } from '@tanstack/react-query'; // Import useQuery
import type { z } from 'zod';

import { trpc } from '@/utils/trpc';

import type { Service } from '../../server/db/types';
import { toNumber } from '../../utils';
import type { ServiceCreateSchema } from '../../zodSchemas';
import { Table } from '../admin/table';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AddService } from './add-service';

type ServiceFormValues = z.infer<typeof ServiceCreateSchema>;

const columns = [
  {
    header: 'ID',
    key: 'id',
    className: 'hidden md:table-cell'
  },
  {
    header: 'Service Name',
    key: 'name', // Note: The key used here should match the data property name, which appears to be 'serviceName' below. I'll use 'serviceName' in the render function.
    className: 'hidden md:table-cell'
  },
  {
    header: 'Price',
    key: 'price',
    className: 'hidden md:table-cell'
  },
  {
    header: 'Description',
    key: 'description',
    className: 'hidden xl:table-cell'
  }
  // {
  //   header: "Actions",
  //   key: "action",
  // },
];

export const ServiceSettings = () => {
  // 1. Fetch data using tRPC hook
  const { data, isLoading, isError } = useQuery(
    trpc.admin.getServices.queryOptions(undefined, {
      // Assuming no input is needed for this query
      staleTime: 1000 * 60 * 5 // Cache for 5 minutes
    })
  );

  // Use an empty array fallback for safety if data is null/undefined
  const services: Service[] = (data as Service[] | undefined) ?? [];

  // 2. Define the renderRow function inside the component to use the fetched data
  const renderRow = (item: Service) => (
    <tr
      className='border-gray-200 border-b text-sm even:bg-slate-50 hover:bg-slate-50'
      key={item.id}
    >
      <td className='flex items-center gap-2 py-4 md:gap-4'>{item?.id}</td>

      {/* FIX: Use the actual data property name 'serviceName' */}
      <td className='hidden md:table-cell'>{item.serviceName}</td>
      <td className='hidden capitalize md:table-cell'>{toNumber(item?.price)}</td>

      <td className='hidden w-[50%] xl:table-cell'>
        <p className='line-clamp-1'>{item.description ?? 'No description'}</p>
      </td>
      <td>{/* Actions slot content goes here */}</td>
    </tr>
  );

  // 3. Handle Loading and Error States
  if (isLoading) {
    return (
      <>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='capitalize'>Services</CardTitle>
          <AddService
            clinicId={''}
            initialData={undefined as unknown as ServiceFormValues}
          />
        </CardHeader>
        <CardContent className='py-8 text-center'>
          <p className='text-gray-500'>Loading services...</p>
        </CardContent>
      </>
    );
  }

  if (isError) {
    return (
      <CardContent className='py-8 text-center'>
        <p className='text-red-500'>Error fetching services.</p>
      </CardContent>
    );
  }

  return (
    <>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='capitalize'>Services</CardTitle>
          <CardDescription>Perform all settings and other parameters of the system from this section .</CardDescription>
        </div>
        <AddService
          clinicId={''}
          initialData={undefined as unknown as ServiceFormValues}
        />
      </CardHeader>

      <CardContent>
        <Table
          columns={columns}
          data={services} // Use the destructured/defaulted array
          renderRow={renderRow}
        />
      </CardContent>
    </>
  );
};
