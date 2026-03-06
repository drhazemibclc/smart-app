// src/app/(protected)/prescriptions/patient/[patientId]/PatientPrescriptionHistory.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MoreVertical,
  Pill,
  Printer,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/utils/formDate';
import { trpc } from '@/utils/trpc';

interface PatientPrescriptionHistoryProps {
  patientId: string;
  clinicId: string;
}

// // Define the prescription type with all necessary relations
// type PrescriptionItem = Prisma.PrescriptionGetPayload<{
//   include: {
//     doctor: { select: { id: true; name: true } };
//     prescribedItems: {
//       include: {
//         drug: { select: { id: true; name: true } };
//       };
//     };
//     encounter: { select: { id: true; diagnosis: true } };
//   };
// }>;

export function PatientPrescriptionHistory({ patientId }: PatientPrescriptionHistoryProps) {
  const router = useRouter();

  // Fetch patient prescription history
  const { data, isLoading, error, refetch } = useQuery(
    trpc.prescription.getPatientHistory.queryOptions({
      patientId,
      limit: 50,
      offset: 0,
      includeInactive: true
    })
  );

  if (isLoading) {
    return <HistorySkeleton />;
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <AlertCircle className='mb-4 h-12 w-12 text-destructive' />
        <h3 className='font-semibold text-lg'>Failed to load prescriptions</h3>
        <p className='mb-4 text-muted-foreground text-sm'>{error.message || 'An error occurred while fetching data'}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const prescriptions = data?.items || [];
  const total = data?.total || 0;

  if (prescriptions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Pill className='mb-4 h-12 w-12 text-muted-foreground' />
        <h3 className='font-semibold text-lg'>No prescriptions found</h3>
        <p className='mb-4 text-muted-foreground text-sm'>This patient doesn't have any prescriptions yet.</p>
        <Button onClick={() => router.push(`/prescriptions/new?patientId=${patientId}`)}>
          Create First Prescription
        </Button>
      </div>
    );
  }

  // Split into active and history
  const activePrescriptions = prescriptions.filter(p => p.status === 'active');
  const pastPrescriptions = prescriptions.filter(p => p.status !== 'active');

  return (
    <div className='space-y-6'>
      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-muted-foreground text-sm'>Total Prescriptions</p>
                <p className='font-bold text-2xl'>{total}</p>
              </div>
              <FileText className='h-8 w-8 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-muted-foreground text-sm'>Active</p>
                <p className='font-bold text-2xl text-green-600'>{activePrescriptions.length}</p>
              </div>
              <Clock className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-muted-foreground text-sm'>Completed</p>
                <p className='font-bold text-2xl text-blue-600'>
                  {pastPrescriptions.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Active/History */}
      <Tabs
        className='space-y-4'
        defaultValue='active'
      >
        <TabsList>
          <TabsTrigger
            className='relative'
            value='active'
          >
            Active
            {activePrescriptions.length > 0 && (
              <Badge
                className='ml-2'
                variant='secondary'
              >
                {activePrescriptions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
        </TabsList>

        <TabsContent
          className='space-y-4'
          value='active'
        >
          {activePrescriptions.length === 0 ? (
            <div className='py-8 text-center text-muted-foreground'>No active prescriptions</div>
          ) : (
            <div className='space-y-4'>
              {activePrescriptions.map(prescription => (
                <ActivePrescriptionCard
                  key={prescription.id}
                  onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                  prescription={prescription}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='history'>
          {pastPrescriptions.length === 0 ? (
            <div className='py-8 text-center text-muted-foreground'>No past prescriptions</div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className='w-[70px]' />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastPrescriptions.map(prescription => (
                    <TableRow
                      className='cursor-pointer hover:bg-muted/50'
                      key={prescription.id}
                      onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                    >
                      <TableCell>{formatDate(prescription.issuedDate)}</TableCell>
                      <TableCell className='font-medium'>
                        {prescription.medicationName || `${prescription.prescribedItems?.length || 0} items`}
                      </TableCell>
                      <TableCell>{prescription.doctor?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <PrescriptionStatusBadge status={prescription.status} />
                      </TableCell>
                      <TableCell>{prescription.prescribedItems?.length || 0}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/prescriptions/${prescription.id}`)}>
                              <Eye className='mr-2 h-4 w-4' />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className='mr-2 h-4 w-4' />
                              Print
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Timeline View (Optional) */}
      {prescriptions.length > 0 && (
        <div className='mt-8'>
          <h3 className='mb-4 font-semibold text-lg'>Prescription Timeline</h3>
          <div className='space-y-4'>
            {prescriptions.slice(0, 5).map(prescription => (
              <TimelineItem
                key={prescription.id}
                onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                prescription={prescription}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Subcomponents ====================

interface ActivePrescriptionCardProps {
  prescription: PrescriptionItem;
  onClick: () => void;
}

function ActivePrescriptionCard({ prescription, onClick }: ActivePrescriptionCardProps) {
  const daysRemaining = prescription.endDate
    ? Math.ceil((new Date(prescription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card
      className='cursor-pointer border-l-4 border-l-green-500 transition-shadow hover:shadow-md'
      onClick={onClick}
    >
      <CardContent className='pt-6'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <h4 className='font-semibold'>{prescription.medicationName || 'Multiple Medications'}</h4>
            <PrescriptionStatusBadge status={prescription.status} />
          </div>

          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Prescribed by</p>
              <p className='font-medium'>Dr. {prescription.doctor?.name || 'Unknown'}</p>
            </div>

            <div>
              <p className='text-muted-foreground text-sm'>Issued</p>
              <p className='font-medium'>{formatDate(prescription.issuedDate)}</p>
            </div>

            {prescription.endDate && (
              <div>
                <p className='text-muted-foreground text-sm'>Valid until</p>
                <p className='font-medium'>{formatDate(prescription.endDate)}</p>
              </div>
            )}

            <div>
              <p className='text-muted-foreground text-sm'>Items</p>
              <p className='font-medium'>{prescription.prescribedItems?.length || 0}</p>
            </div>
          </div>

          {daysRemaining !== null && daysRemaining <= 7 && (
            <div className='flex items-center gap-2 rounded-md bg-amber-50 p-2 text-amber-600 text-sm'>
              <AlertCircle className='h-4 w-4' />
              <span>
                {daysRemaining <= 0 ? 'Expired' : `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}
              </span>
            </div>
          )}

          {prescription.instructions && (
            <p className='mt-2 text-muted-foreground text-sm'>
              <span className='font-medium'>Instructions:</span> {prescription.instructions}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TimelineItemProps {
  prescription: PrescriptionItem;
  onClick: () => void;
}

function TimelineItem({ prescription, onClick }: TimelineItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className='h-4 w-4 text-green-500' />;
      case 'completed':
        return <CheckCircle2 className='h-4 w-4 text-blue-500' />;
      case 'cancelled':
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return <FileText className='h-4 w-4 text-gray-500' />;
    }
  };

  return (
    <div
      className='flex cursor-pointer gap-4 rounded-lg border p-4 hover:bg-muted/50'
      onClick={onClick}
    >
      <div className='mt-1 shrink-0'>{getStatusIcon(prescription.status)}</div>

      <div className='flex-1'>
        <div className='mb-1 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='font-medium'>{prescription.medicationName || 'Multiple Medications'}</span>
            <PrescriptionStatusBadge status={prescription.status} />
          </div>
          <span className='text-muted-foreground text-sm'>{formatDate(prescription.issuedDate)}</span>
        </div>

        <div className='flex items-center gap-4 text-sm'>
          <span>Dr. {prescription.doctor?.name || 'Unknown'}</span>
          <span>•</span>
          <span>{prescription.prescribedItems?.length || 0} items</span>
          {prescription.endDate && (
            <>
              <span>•</span>
              <span className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                Until {formatDate(prescription.endDate)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Import the status badge component (make sure it's exported from the correct path)
import type { PrescriptionItem } from '@/types/prescription';

import { PrescriptionStatusBadge } from './PrescriptionStatusBadge';

function HistorySkeleton() {
  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-3'>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className='pt-6'>
              <Skeleton className='mb-2 h-4 w-24' />
              <Skeleton className='h-8 w-16' />
            </CardContent>
          </Card>
        ))}
      </div>

      <Skeleton className='h-10 w-64' />

      {[...Array(3)].map((_, i) => (
        <Skeleton
          className='h-32 w-full'
          key={i}
        />
      ))}
    </div>
  );
}
