'use client';

import type { Decimal } from '@prisma/client/runtime/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Edit, Eye, FileText, Heart, Plus, Search, Thermometer, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MedicalRecords } from '@/server/db/types';
import { trpc } from '@/utils/trpc';

import type { AccessLevel, Gender } from '../../../../generated/prisma/enums';
import { AddMedicalRecordModal } from './add-medical-record-modal';
import { MedicalRecordDetails } from './medical-record-details';
import { MedicalRecordFilters } from './medical-record-filters';
import { MedicalStatsCards } from './medical-stats-cards';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
}

interface MedicalRecordsClientProps {
  patients: Patient[];
  doctors: Doctor[];
  clinicId: string;
  userId: string;
  userRole: string;
}

export function MedicalRecordsClient({ patients, doctors, clinicId, userId }: MedicalRecordsClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecords | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const pageSize = 10;

  // Fetch medical records with filters
  const { data: recordsData, isLoading } = useQuery({
    ...trpc.medical.getMedicalRecordsByClinic.queryOptions({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      startDate: dateRange.from,
      endDate: dateRange.to,
      patientId: selectedPatientId !== 'all' ? selectedPatientId : undefined,
      doctorId: selectedDoctorId !== 'all' ? selectedDoctorId : undefined
    }),
    enabled: true
  });

  // Delete mutation
  const deleteRecord = useMutation({
    mutationFn: async (recordId: string) => {
      return await fetch('/api/trpc/medical.deleteMedicalRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast.success('Medical record deleted successfully');
      queryClient.invalidateQueries({
        queryKey: trpc.medical.getMedicalRecordsByClinic.queryKey({})
      });
    },
    onError: () => {
      toast.error('Failed to delete medical record');
    }
  });

  const handleDelete = (recordId: string) => {
    if (confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      deleteRecord.mutate(recordId);
    }
  };

  const handleViewDetails = (
    record: {
      doctor: { id: string; name: string; specialty: string } | null;
      patient: {
        id: string;
        image: string | null;
        colorCode: string | null;
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        gender: Gender;
      } | null;
      growthRecords: {
        createdAt: Date;
        weight: number | null;
        height: number | null;
        headCircumference: Decimal | null;
      }[];
      encounter: { type: string | null; id: string; date: Date; diagnosis: string | null }[];
      vitalSigns: {
        recordedAt: Date;
        bodyTemperature: number | null;
        systolic: number | null;
        diastolic: number | null;
        heartRate: number | null;
        respiratoryRate: number | null;
        oxygenSaturation: number | null;
      }[];
    } & {
      clinicId: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      isDeleted: boolean | null;
      patientId: string;
      doctorId: string | null;
      diagnosis: string | null;
      notes: string | null;
      symptoms: string | null;
      appointmentId: string;
      treatmentPlan: string | null;
      labRequest: string | null;
      attachments: string | null;
      followUpDate: Date | null;
      subjective: string | null;
      objective: string | null;
      assessment: string | null;
      plan: string | null;
      isConfidential: boolean;
      accessLevel: AccessLevel;
      lastAccessedAt: Date | null;
      lastAccessedBy: string | null;
    }
  ) => {
    setSelectedRecord(record as MedicalRecords);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (recordId: string) => {
    router.push(`/dashboard/medical-records/${recordId}/edit`);
  };

  const getConfidentialityBadge = (isConfidential: boolean, accessLevel: string) => {
    if (isConfidential) {
      return <Badge variant='destructive'>Confidential</Badge>;
    }
    if (accessLevel === 'RESTRICTED') {
      return <Badge variant='secondary'>Restricted</Badge>;
    }
    if (accessLevel === 'SENSITIVE') {
      return <Badge variant='outline'>Sensitive</Badge>;
    }
    return null;
  };
  const Id = useId();
  return (
    <div className='container mx-auto max-w-7xl space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl'>Medical Records</h1>
          <p className='text-muted-foreground'>
            Manage and view patient medical records, diagnoses, and clinical notes
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          New Medical Record
        </Button>
      </div>

      {/* Stats Cards */}
      <MedicalStatsCards clinicId={clinicId} />

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='grid gap-4 md:grid-cols-4'>
            <div className='space-y-2'>
              <label
                className='block font-medium text-sm'
                htmlFor='search'
              >
                Search
              </label>
              <div className='relative'>
                <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
                <Input
                  className='pl-8'
                  id='search'
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Search records...'
                  value={searchQuery}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label
                className='block font-medium text-sm'
                htmlFor='patient-filter'
              >
                Patient
              </label>
              <Select
                onValueChange={setSelectedPatientId}
                value={selectedPatientId}
              >
                <SelectTrigger id='patient-filter'>
                  <SelectValue placeholder='All Patients' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Patients</SelectItem>
                  {patients.map(patient => (
                    <SelectItem
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.lastName}, {patient.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label
                className='block font-medium text-sm'
                htmlFor='doctor-filter'
              >
                Doctor
              </label>
              <Select
                onValueChange={setSelectedDoctorId}
                value={selectedDoctorId}
              >
                <SelectTrigger id='doctor-filter'>
                  <SelectValue placeholder='All Doctors' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Doctors</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem
                      key={doctor.id}
                      value={doctor.id}
                    >
                      Dr. {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <div className='block font-medium text-sm'>Date Range</div>
              <MedicalRecordFilters onDateRangeChange={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs
        className='space-y-4'
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList>
          <TabsTrigger value='all'>All Records</TabsTrigger>
          <TabsTrigger value='recent'>Recent</TabsTrigger>
          <TabsTrigger value='confidential'>Confidential</TabsTrigger>
          <TabsTrigger value='followup'>Needs Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent
          className='space-y-4'
          value='all'
        >
          {/* Medical Records Table */}
          <Card>
            <CardContent className='p-0'>
              {isLoading ? (
                <div className='space-y-3 p-4'>
                  {[...Array(5)].map(_ => (
                    <Skeleton
                      className='h-16 w-full'
                      key={Id}
                    />
                  ))}
                </div>
              ) : recordsData?.data && recordsData.data.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Vitals</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recordsData.data.map(record => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4 text-muted-foreground' />
                              <span>{format(new Date(record.createdAt ?? new Date()), 'MMM d, yyyy')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <User className='h-4 w-4 text-muted-foreground' />
                              <div>
                                <div className='font-medium'>
                                  {record.patient?.firstName} {record.patient?.lastName}
                                </div>
                                <div className='text-muted-foreground text-xs'>
                                  {record.patient?.dateOfBirth &&
                                    format(new Date(record.patient.dateOfBirth), 'MMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>Dr. {record.doctor?.name}</div>
                              <div className='text-muted-foreground text-xs'>
                                {record.doctor?.specialty || 'General'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='max-w-[200px]'>
                              <div className='truncate font-medium'>
                                {record.diagnosis || record.assessment || 'No diagnosis'}
                              </div>
                              {record.isConfidential && (
                                <div className='mt-1'>
                                  {getConfidentialityBadge(record.isConfidential, record.accessLevel ?? 'STANDARD')}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.vitalSigns && (
                              <div className='flex items-center gap-2 text-sm'>
                                {record.vitalSigns[0].bodyTemperature && (
                                  <div
                                    className='flex items-center'
                                    title='Temperature'
                                  >
                                    <Thermometer className='h-3 w-3 text-red-500' />
                                    <span className='ml-1'>{record.vitalSigns[0].bodyTemperature}°C</span>
                                  </div>
                                )}
                                {record.vitalSigns[0].heartRate && (
                                  <div
                                    className='flex items-center'
                                    title='Heart Rate'
                                  >
                                    <Heart className='h-3 w-3 text-red-500' />
                                    <span className='ml-1'>{record.vitalSigns[0].heartRate}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.followUpDate ? 'default' : 'secondary'}>
                              {record.followUpDate ? 'Follow-up' : 'Completed'}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                                  <Eye className='mr-2 h-4 w-4' />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(record.id ?? '')}>
                                  <Edit className='mr-2 h-4 w-4' />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='text-red-600'
                                  onClick={() => handleDelete(record.id ?? '')}
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

                  {/* Pagination */}
                  {recordsData.totalPages > 1 && (
                    <div className='flex items-center justify-between border-t px-4 py-4'>
                      <div className='text-muted-foreground text-sm'>
                        Showing {(currentPage - 1) * pageSize + 1} to{' '}
                        {Math.min(currentPage * pageSize, recordsData.total)} of {recordsData.total} records
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          size='sm'
                          variant='outline'
                        >
                          Previous
                        </Button>
                        <Button
                          disabled={currentPage >= recordsData.totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          size='sm'
                          variant='outline'
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className='flex flex-col items-center justify-center py-12'>
                  <FileText className='h-12 w-12 text-muted-foreground' />
                  <p className='mt-2 text-muted-foreground'>No medical records found</p>
                  <Button
                    className='mt-4'
                    onClick={() => setIsAddModalOpen(true)}
                    variant='outline'
                  >
                    Create your first record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='recent'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Medical Records</CardTitle>
            </CardHeader>
            <CardContent>{/* Add recent records view */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='confidential'>
          <Card>
            <CardHeader>
              <CardTitle>Confidential Records</CardTitle>
            </CardHeader>
            <CardContent>{/* Add confidential records view */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='followup'>
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Required</CardTitle>
            </CardHeader>
            <CardContent>{/* Add follow-up records view */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Medical Record Modal */}
      <AddMedicalRecordModal
        clinicId={clinicId}
        doctors={doctors}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: trpc.medical.getMedicalRecordsByClinic.queryKey({})
          });
        }}
        open={isAddModalOpen}
        patients={patients}
        userId={userId}
      />

      {/* Medical Record Details Modal */}
      <Dialog
        onOpenChange={setIsDetailsModalOpen}
        open={isDetailsModalOpen}
      >
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>Complete medical record information</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <MedicalRecordDetails
              onClose={() => setIsDetailsModalOpen(false)}
              record={selectedRecord}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
