'use client';

import { format } from 'date-fns';
import { Activity, Calendar, Edit, FileText, Mail, MapPin, Phone, Pill, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import { useId } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Patient {
  _count?: {
    appointments: number;
    growthRecords?: number;
    immunizations?: number;
    medicalRecords: number;
    prescriptions: number;
  };
  id: string;
  image: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  address: string | null;
  email: string | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  allergies: string | null;
  colorCode: string | null;
  bloodGroup: string | null;
  medicalConditions: string | null;
  medicalHistory: string | null;
  appointments?: Array<{
    id?: string;
    reason?: string | null;
    status?: string | null;
    appointmentDate: Date;
    doctor: {
      name: string;
      specialty: string | null;
    } | null;
  }>;
  medicalRecords?: Array<{
    createdAt: Date;
    diagnosis: string;
    id: string;
    notes: string | null;
    treatment: string | null;
  }>;
  phone: string | null;
  prescriptions?: Array<{
    createdAt: Date;
    id: string;
    items: Array<{
      dosage: string;
      drug: {
        name: string;
      };
      frequency: string;
    }>;
  }>;
  status: 'ACTIVE' | 'INACTIVE' | 'DORMANT' | null;
}

interface PatientDetailClientProps {
  patient: Patient;
}

function calculateAge(dateOfBirth: Date): string {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 1) {
    const months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  return `${age} year${age !== 1 ? 's' : ''}`;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function PatientDetailClient({ patient }: PatientDetailClientProps) {
  const Id = useId();
  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex items-start gap-4'>
              <Avatar className='h-20 w-20'>
                <AvatarImage
                  alt={patient.firstName}
                  src={patient.image ?? undefined}
                />
                <AvatarFallback
                  className='text-white text-xl'
                  style={{
                    backgroundColor: patient.colorCode ?? '#4ECDC4'
                  }}
                >
                  {getInitials(patient.firstName, patient.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className='font-semibold text-2xl'>
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className='text-muted-foreground'>
                  {calculateAge(patient.dateOfBirth)} • {patient.gender === 'MALE' ? 'Male' : 'Female'}
                </p>
                <div className='mt-2'>
                  <Badge variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {patient.status?.toLowerCase() ?? 'unknown'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              asChild
              size='sm'
            >
              <Link href={`/dashboard/patients/${patient.id}/edit`}>
                <Edit className='mr-2 h-4 w-4' />
                Edit Patient
              </Link>
            </Button>
          </div>

          <Separator className='my-6' />

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='flex items-start gap-3'>
              <Mail className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Email</p>
                <p className='text-muted-foreground text-sm'>{patient.email || 'Not provided'}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Phone className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Phone</p>
                <p className='text-muted-foreground text-sm'>{patient.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <MapPin className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Address</p>
                <p className='text-muted-foreground text-sm'>{patient.address || 'Not provided'}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Calendar className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Date of Birth</p>
                <p className='text-muted-foreground text-sm'>{format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Activity className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Blood Group</p>
                <p className='text-muted-foreground text-sm'>{patient.bloodGroup || 'Not provided'}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <User className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Emergency Contact</p>
                <p className='text-muted-foreground text-sm'>
                  {patient.emergencyContactName || 'Not provided'}
                  {patient.emergencyContactNumber && ` (${patient.emergencyContactNumber})`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Calendar className='h-4 w-4' />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-bold text-3xl'>{patient._count?.appointments ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <FileText className='h-4 w-4' />
              Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-bold text-3xl'>{patient._count?.medicalRecords ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Pill className='h-4 w-4' />
              Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-bold text-3xl'>{patient._count?.prescriptions ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <TrendingUp className='h-4 w-4' />
              Growth Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-bold text-3xl'>{patient._count?.growthRecords ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        className='w-full'
        defaultValue='overview'
      >
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='appointments'>Appointments</TabsTrigger>
          <TabsTrigger value='medical'>Medical Records</TabsTrigger>
          <TabsTrigger value='prescriptions'>Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent
          className='space-y-4'
          value='overview'
        >
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {patient.allergies && (
                <div>
                  <p className='mb-1 font-medium text-sm'>Allergies</p>
                  <p className='text-muted-foreground text-sm'>{patient.allergies}</p>
                </div>
              )}
              {patient.medicalConditions && (
                <div>
                  <p className='mb-1 font-medium text-sm'>Medical Conditions</p>
                  <p className='text-muted-foreground text-sm'>{patient.medicalConditions}</p>
                </div>
              )}
              {patient.medicalHistory && (
                <div>
                  <p className='mb-1 font-medium text-sm'>Medical History</p>
                  <p className='text-muted-foreground text-sm'>{patient.medicalHistory}</p>
                </div>
              )}
              {!patient.allergies && !patient.medicalConditions && !patient.medicalHistory && (
                <p className='text-muted-foreground text-sm'>No medical information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          className='space-y-4'
          value='appointments'
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>View all appointments for this patient</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.appointments && patient.appointments.length > 0 ? (
                <div className='space-y-3'>
                  {patient.appointments.slice(0, 5).map(appointment => (
                    <div
                      className='flex items-center justify-between rounded-lg border p-3'
                      key={appointment.id}
                    >
                      <div>
                        <p className='font-medium text-sm'>{appointment.reason || 'General Checkup'}</p>
                        <p className='text-muted-foreground text-xs'>
                          {appointment.doctor ? `Dr. ${appointment.doctor.name}` : 'No doctor assigned'}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm'>{format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}</p>
                        <Badge
                          className='mt-1'
                          variant='outline'
                        >
                          {String(appointment.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>No appointments found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          className='space-y-4'
          value='medical'
        >
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>View all medical records for this patient</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.medicalRecords && patient.medicalRecords.length > 0 ? (
                <div className='space-y-3'>
                  {patient.medicalRecords.slice(0, 5).map(record => (
                    <div
                      className='rounded-lg border p-3'
                      key={record.id}
                    >
                      <div className='mb-2 flex items-start justify-between'>
                        <p className='font-medium text-sm'>{record.diagnosis}</p>
                        <p className='text-muted-foreground text-xs'>
                          {format(new Date(record.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {record.treatment && (
                        <p className='text-muted-foreground text-sm'>Treatment: {record.treatment}</p>
                      )}
                      {record.notes && <p className='mt-1 text-muted-foreground text-sm'>{record.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>No medical records found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          className='space-y-4'
          value='prescriptions'
        >
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>View all prescriptions for this patient</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.prescriptions && patient.prescriptions.length > 0 ? (
                <div className='space-y-3'>
                  {patient.prescriptions.slice(0, 5).map(prescription => (
                    <div
                      className='rounded-lg border p-3'
                      key={prescription.id}
                    >
                      <div className='mb-2 flex items-start justify-between'>
                        <p className='font-medium text-sm'>Prescription</p>
                        <p className='text-muted-foreground text-xs'>
                          {format(new Date(prescription.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        {prescription.items.map(item => (
                          <p
                            className='text-muted-foreground text-sm'
                            key={Id + item.drug}
                          >
                            • {item.drug.name} - {item.dosage} ({item.frequency})
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>No prescriptions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
