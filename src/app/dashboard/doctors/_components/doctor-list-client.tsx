'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Filter, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteDoctorAction } from '@/actions/doctor.action';
import { DoctorTable } from '@/app/dashboard/doctors/_components/doctor-table';
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
import { trpc } from '@/utils/trpc';

interface Doctor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string;
  licenseNumber: string | null;
  isActive: boolean | null;
  img: string | null;
  colorCode: string | null;
  appointmentPrice: number;
  _count?: {
    appointments: number;
  };
}

export function DoctorListClient() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery(trpc.doctor.getAll.queryOptions());

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoctorAction(id);
    },
    onSuccess: () => {
      toast.success('Doctor deleted successfully');
      router.refresh();
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete doctor');
    }
  });

  const doctors = (data?.doctors as unknown as Doctor[]) || [];

  // Extract unique specialties for filter dropdown
  const specialties = [...new Set(doctors.map(d => d.specialty))];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch =
      search === '' ||
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      (doctor.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (doctor.phone?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (doctor.specialty?.toLowerCase() || '').includes(search.toLowerCase());

    const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && doctor.isActive === true) ||
      (statusFilter === 'inactive' && doctor.isActive === false);

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex h-64 items-center justify-center'>
            <div className='text-muted-foreground'>Loading doctors...</div>
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
                placeholder='Search doctors by name, email, phone, or specialty...'
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
                <Link href='/dashboard/doctors/new'>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Doctor
                </Link>
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div>
                <label
                  className='mb-2 block font-medium text-sm'
                  htmlFor='specialty-filter'
                >
                  Specialty
                </label>
                <Select
                  onValueChange={setSpecialtyFilter}
                  value={specialtyFilter}
                >
                  <SelectTrigger id='specialty-filter'>
                    <SelectValue placeholder='All specialties' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All specialties</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem
                        key={specialty}
                        value={specialty}
                      >
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className='mb-4 flex items-center justify-between'>
            <p className='text-muted-foreground text-sm'>
              Showing {filteredDoctors.length} of {doctors.length} doctors
            </p>
          </div>

          <DoctorTable
            doctors={filteredDoctors}
            isDeleting={deleteMutation.isPending}
            onDelete={handleDelete}
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
              This will permanently delete this doctor and all associated records. This action cannot be undone.
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
