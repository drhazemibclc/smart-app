'use client';

import { useQuery } from '@tanstack/react-query';
import { Download, Eye, MoreVertical, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/utils/formDate';

import { cn } from '../../../../lib/utils';
import type { PrescriptionWithRelations as PrescriptionItem } from '../../../../types/prescription';
import { trpc } from '../../../../utils/trpc';
import { PrescriptionStatusBadge } from './PrescriptionStatusBadge';

interface PrescriptionListProps {
  clinicId: string;
  status?: 'active' | 'completed' | 'cancelled';
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

// Define the prescription type with all necessary relations including patient
// type PrescriptionItem = Prisma.PrescriptionGetPayload<{
//   include: {
//     doctor: { select: { id: true; name: true } };
//     prescribedItems: {
//       include: {
//         drug: { select: { id: true; name: true } };
//       };
//     };
//     encounter: { select: { id: true; diagnosis: true } };
//     patient: { select: { id: true; firstName: true; lastName: true } };
//   };
// }>;

type PrescriptionItemWithOptionalPatient = Omit<PrescriptionItem, 'patient'> & {
  patient?: PrescriptionItem['patient'] | null;
};

export function PrescriptionList({
  clinicId,
  status,
  limit = 20,
  offset = 0,
  startDate,
  endDate
}: PrescriptionListProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    trpc.prescription.getClinicPrescriptions.queryOptions({
      clinicId,
      status,
      limit,
      offset,
      startDate,
      endDate
    })
  );

  const prescriptions = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  // Helper function to get patient display name
  const getPatientName = (prescription: PrescriptionItemWithOptionalPatient): string => {
    // Check if patient data is included (as object with firstName/lastName)
    if (prescription.patient && typeof prescription.patient === 'object') {
      const patient = prescription.patient as { firstName?: string; lastName?: string };
      if (patient.firstName || patient.lastName) {
        return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient';
      }
    }

    // Fallback to patientId if it's a string
    if (prescription.patientId && typeof prescription.patientId === 'string') {
      return `Patient ID: ${prescription.patientId.substring(0, 8)}...`;
    }

    return 'Unknown Patient';
  };

  // Helper function to check if patient has avatar
  const hasAvatar = (prescription: PrescriptionItemWithOptionalPatient): boolean => {
    if (prescription.patient && typeof prescription.patient === 'object') {
      const patient = prescription.patient as { image?: string | null };
      return !!patient.image;
    }
    return false;
  };

  if (isLoading) {
    return <ListSkeleton />;
  }

  if (!prescriptions.length) {
    return <div className='py-12 text-center text-muted-foreground'>No prescriptions found</div>;
  }

  return (
    <div className='space-y-4'>
      <Card className='overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className='w-[60px]' />
            </TableRow>
          </TableHeader>

          <TableBody>
            {prescriptions.map(p => (
              <TableRow
                className='cursor-pointer hover:bg-muted/50'
                key={p.id}
                onClick={() => router.push(`/prescriptions/${p.id}`)}
              >
                <TableCell
                  className={cn('whitespace-nowrap p-2 align-middle', {
                    'pl-4': hasAvatar(p)
                  })}
                  data-slot='table-cell'
                >
                  {getPatientName(p)}
                </TableCell>

                <TableCell>{p.doctor?.name ?? 'N/A'}</TableCell>

                <TableCell>{p.medicationName ?? `${p.prescribedItems?.length ?? 0} items`}</TableCell>

                <TableCell>{formatDate(p.issuedDate)}</TableCell>

                <TableCell>{p.endDate ? formatDate(p.endDate) : 'Ongoing'}</TableCell>

                <TableCell>
                  <PrescriptionStatusBadge status={p.status as 'active' | 'completed' | 'cancelled'} />
                </TableCell>

                <TableCell>{p.prescribedItems?.length ?? 0}</TableCell>

                <TableCell onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size='icon'
                        variant='ghost'
                      >
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => router.push(`/prescriptions/${p.id}`)}>
                        <Eye className='mr-2 h-4 w-4' />
                        View
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => router.push(`/prescriptions/${p.id}/print`)}>
                        <Printer className='mr-2 h-4 w-4' />
                        Print
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => router.push(`/prescriptions/${p.id}/download`)}>
                        <Download className='mr-2 h-4 w-4' />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className='flex items-center justify-end gap-2'>
          <Button
            disabled={currentPage === 1}
            onClick={() => router.push(`?page=${currentPage - 1}`)}
            size='sm'
            variant='outline'
          >
            Previous
          </Button>

          <span className='text-muted-foreground text-sm'>
            Page {currentPage} / {totalPages}
          </span>

          <Button
            disabled={currentPage === totalPages}
            onClick={() => router.push(`?page=${currentPage + 1}`)}
            size='sm'
            variant='outline'
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton
          className='h-12 w-full'
          key={i}
        />
      ))}
    </div>
  );
}
