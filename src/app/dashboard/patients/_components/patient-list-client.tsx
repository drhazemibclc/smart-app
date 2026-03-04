'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Filter, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { deletePatientAction } from '@/actions/patient.action';
import { PatientTable } from '@/components/patients/patient-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/trpc/query-client';

// Define the patient type based on your schema
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  status: 'ACTIVE' | 'INACTIVE' | 'DORMANT' | null;
  image: string | null;
  colorCode: string | null;
  address: string | null;
  bloodGroup: string | null;
  createdAt: Date;
  _count?: {
    appointments: number;
    medicalRecords: number;
    prescriptions: number;
  };
}

export function PatientListClient() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fix: Use the correct tRPC query syntax
  const { data, isLoading } = useQuery(trpc.patient.getAll.queryOptions());

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deletePatientAction(id);
    },
    onSuccess: () => {
      toast.success('Patient deleted successfully');
      router.refresh();
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete patient');
    }
  });

  const patients = (data?.patients as Patient[]) || [];

  // Fix: Properly filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      search === '' ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (patient.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (patient.phone?.toLowerCase() || '').includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  // Fix: Add proper loading state return
  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex h-64 items-center justify-center'>
            <div className='text-muted-foreground'>Loading patients...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className='p-6'>
          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='relative flex-1'>
              <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
              <Input
                className='pl-9'
                onChange={e => setSearch(e.target.value)}
                placeholder='Search patients by name, email, or phone...'
                value={search}
              />
              {search && (
                <Button
                  className='absolute top-1.5 right-1.5 h-7 w-7'
                  onClick={() => setSearch('')}
                  size='icon'
                  variant='ghost'
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                size='sm'
                variant='outline'
              >
                <Filter className='mr-2 h-4 w-4' />
                Filters
              </Button>
              <Button
                asChild
                size='sm'
              >
                <Link href='/dashboard/patients/new'>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Patient
                </Link>
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div>
                <label
                  className='mb-2 block font-medium text-sm'
                  htmlFor='status-filter'
                >
                  Status
                </label>
                <Select
                  onValueChange={setStatusFilter}
                  value={statusFilter}
                >
                  <SelectTrigger id='status-filter'>
                    <SelectValue placeholder='All statuses' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All statuses</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='INACTIVE'>Inactive</SelectItem>
                    <SelectItem value='DORMANT'>Dormant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  className='mb-2 block font-medium text-sm'
                  htmlFor='gender-filter'
                >
                  Gender
                </label>
                <Select
                  onValueChange={setGenderFilter}
                  value={genderFilter}
                >
                  <SelectTrigger id='gender-filter'>
                    <SelectValue placeholder='All genders' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All genders</SelectItem>
                    <SelectItem value='MALE'>Male</SelectItem>
                    <SelectItem value='FEMALE'>Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className='mb-4 flex items-center justify-between'>
            <p className='text-muted-foreground text-sm'>
              Showing {filteredPatients.length} of {patients.length} patients
            </p>
          </div>

          <PatientTable
            isDeleting={deleteMutation.isPending}
            onDelete={handleDelete}
            patients={filteredPatients}
          />
        </CardContent>
      </Card>

      <AlertDialog
        onOpenChange={open => !open && setDeleteId(null)}
        open={!!deleteId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this patient and all associated records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
