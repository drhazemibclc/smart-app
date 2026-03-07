'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/utils/trpc';

export function MedicalRecordsList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery(
    trpc.medical.listRecords.queryOptions({
      limit: 50,
      page: 1
    })
  );

  const filteredRecords = data?.records?.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.patient?.firstName?.toLowerCase().includes(searchLower) ||
      record.patient?.lastName?.toLowerCase().includes(searchLower) ||
      record.doctor?.name?.toLowerCase().includes(searchLower) ||
      record.diagnosis?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl tracking-tight'>Medical Records</h1>
          <p className='text-muted-foreground'>Manage patient encounters and medical records</p>
        </div>
        <Link href='/admin/record/new'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Encounter
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical Records</CardTitle>
          <CardDescription>View and manage all patient encounters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative mb-4'>
            <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
            <Input
              className='pl-8'
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search records...'
              value={searchTerm}
            />
          </div>

          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>Loading records...</p>
            </div>
          ) : filteredRecords && filteredRecords.length > 0 ? (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {record.patient?.firstName} {record.patient?.lastName}
                      </TableCell>
                      <TableCell>{record.doctor?.name || 'N/A'}</TableCell>
                      <TableCell className='max-w-xs truncate'>{record.diagnosis || 'No diagnosis'}</TableCell>
                      <TableCell>
                        <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-1 font-medium text-green-700 text-xs'>
                          Completed
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Link href={`/admin/record/${record.id}`}>
                          <Button
                            size='sm'
                            variant='ghost'
                          >
                            <FileText className='mr-2 h-4 w-4' />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <FileText className='mb-4 h-12 w-12 text-muted-foreground' />
              <h3 className='font-semibold text-lg'>No medical records found</h3>
              <p className='mt-2 text-muted-foreground text-sm'>
                {searchTerm ? 'Try adjusting your search' : 'Create your first encounter to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
