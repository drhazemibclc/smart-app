'use client';

import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface DoctorTableProps {
  doctors: Doctor[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function DoctorTable({ doctors, onDelete, isDeleting }: DoctorTableProps) {
  if (doctors.length === 0) {
    return (
      <div className='flex h-64 flex-col items-center justify-center rounded-lg border border-dashed'>
        <p className='text-muted-foreground'>No doctors found</p>
        <Button
          asChild
          className='mt-4'
          size='sm'
          variant='outline'
        >
          <Link href='/dashboard/doctors/new'>Add your first doctor</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doctor</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>License #</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Appointments</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map(doctor => (
            <TableRow key={doctor.id}>
              <TableCell>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-9 w-9'>
                    <AvatarImage
                      alt={doctor.name}
                      src={doctor.img ?? undefined}
                    />
                    <AvatarFallback
                      style={{
                        backgroundColor: doctor.colorCode ?? '#4ECDC4'
                      }}
                    >
                      {getInitials(doctor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{doctor.name}</p>
                    <p className='text-muted-foreground text-xs'>{doctor.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant='outline'>{doctor.specialty}</Badge>
              </TableCell>
              <TableCell>
                <span className='font-mono text-xs'>{doctor.licenseNumber || '—'}</span>
              </TableCell>
              <TableCell>
                {doctor.phone ? (
                  <span className='text-sm'>{doctor.phone}</span>
                ) : (
                  <span className='text-muted-foreground text-sm'>—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant='secondary'>{doctor._count?.appointments ?? 0}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size='icon'
                      variant='ghost'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                      <span className='sr-only'>Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/doctors/${doctor.id}`}>
                        <Eye className='mr-2 h-4 w-4' />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/doctors/${doctor.id}/edit`}>
                        <Edit className='mr-2 h-4 w-4' />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      disabled={isDeleting}
                      onClick={() => onDelete(doctor.id)}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
