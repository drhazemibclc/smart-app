'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Activity, Calendar, FileText, Pill, Stethoscope, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';

interface MedicalRecordDetailProps {
  id: string;
}

interface Patient {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: Date;
}

interface Doctor {
  name?: string;
  specialty?: string;
}

interface VitalSigns {
  bodyTemperature?: number;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

interface MedicalRecord {
  id: string;
  createdAt: Date;
  symptoms?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  followUpDate?: Date;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  labRequest?: string;
  patient?: Patient;
  doctor?: Doctor;
  vitalSigns?: VitalSigns;
}

export function MedicalRecordDetail({ id }: MedicalRecordDetailProps) {
  const router = useRouter();

  // Use the correct procedure - assuming there's a getMedicalRecordById that takes just id
  // If not, we might need to use getMedicalRecordsByClinic with filtering
  const { data, isLoading } = useQuery(
    trpc.medical.getMedicalRecordById.queryOptions({
      id
    })
  );
  const record = data as MedicalRecord | undefined;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading medical record...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <FileText className='mb-4 h-12 w-12 text-muted-foreground' />
        <h3 className='font-semibold text-lg'>Record not found</h3>
        <p className='mt-2 text-muted-foreground text-sm'>The medical record you're looking for doesn't exist</p>
        <Button
          className='mt-4'
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl tracking-tight'>Medical Record</h1>
          <p className='text-muted-foreground'>
            {record.patient?.firstName} {record.patient?.lastName} - {format(new Date(record.createdAt), 'PPP')}
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          variant='outline'
        >
          Back
        </Button>
      </div>

      {/* Patient & Doctor Info */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
            <User className='mr-2 h-4 w-4 text-muted-foreground' />
            <CardTitle className='font-medium text-sm'>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div>
                <p className='font-medium text-sm'>Name</p>
                <p className='text-muted-foreground text-sm'>
                  {record.patient?.firstName} {record.patient?.lastName}
                </p>
              </div>
              <div>
                <p className='font-medium text-sm'>Gender</p>
                <p className='text-muted-foreground text-sm capitalize'>{record.patient?.gender?.toLowerCase()}</p>
              </div>
              <div>
                <p className='font-medium text-sm'>Date of Birth</p>
                <p className='text-muted-foreground text-sm'>
                  {record.patient?.dateOfBirth ? format(new Date(record.patient.dateOfBirth), 'PPP') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
            <Stethoscope className='mr-2 h-4 w-4 text-muted-foreground' />
            <CardTitle className='font-medium text-sm'>Doctor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div>
                <p className='font-medium text-sm'>Name</p>
                <p className='text-muted-foreground text-sm'>{record.doctor?.name || 'N/A'}</p>
              </div>
              <div>
                <p className='font-medium text-sm'>Specialty</p>
                <p className='text-muted-foreground text-sm'>{record.doctor?.specialty || 'N/A'}</p>
              </div>
              <div>
                <p className='font-medium text-sm'>Encounter Date</p>
                <p className='text-muted-foreground text-sm'>{format(new Date(record.createdAt), 'PPP')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs
        className='space-y-4'
        defaultValue='clinical'
      >
        <TabsList>
          <TabsTrigger value='clinical'>
            <FileText className='mr-2 h-4 w-4' />
            Clinical Notes
          </TabsTrigger>
          <TabsTrigger value='vitals'>
            <Activity className='mr-2 h-4 w-4' />
            Vital Signs
          </TabsTrigger>
          <TabsTrigger value='prescriptions'>
            <Pill className='mr-2 h-4 w-4' />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value='labs'>
            <Calendar className='mr-2 h-4 w-4' />
            Lab Tests
          </TabsTrigger>
        </TabsList>

        {/* Clinical Notes Tab */}
        <TabsContent
          className='space-y-4'
          value='clinical'
        >
          <Card>
            <CardHeader>
              <CardTitle>Clinical Assessment</CardTitle>
              <CardDescription>Diagnosis and treatment information</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {record.symptoms && (
                <div>
                  <h4 className='mb-2 font-semibold text-sm'>Symptoms</h4>
                  <p className='text-muted-foreground text-sm'>{record.symptoms}</p>
                </div>
              )}

              {record.diagnosis && (
                <div>
                  <h4 className='mb-2 font-semibold text-sm'>Diagnosis</h4>
                  <p className='text-muted-foreground text-sm'>{record.diagnosis}</p>
                </div>
              )}

              {record.treatmentPlan && (
                <div>
                  <h4 className='mb-2 font-semibold text-sm'>Treatment Plan</h4>
                  <p className='text-muted-foreground text-sm'>{record.treatmentPlan}</p>
                </div>
              )}

              {record.notes && (
                <div>
                  <h4 className='mb-2 font-semibold text-sm'>Additional Notes</h4>
                  <p className='text-muted-foreground text-sm'>{record.notes}</p>
                </div>
              )}

              {record.followUpDate && (
                <div>
                  <h4 className='mb-2 font-semibold text-sm'>Follow-up Date</h4>
                  <p className='text-muted-foreground text-sm'>{format(new Date(record.followUpDate), 'PPP')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SOAP Notes */}
          {(record.subjective || record.objective || record.assessment || record.plan) && (
            <Card>
              <CardHeader>
                <CardTitle>SOAP Notes</CardTitle>
                <CardDescription>Structured clinical documentation</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {record.subjective && (
                  <div>
                    <h4 className='mb-2 font-semibold text-sm'>Subjective</h4>
                    <p className='text-muted-foreground text-sm'>{record.subjective}</p>
                  </div>
                )}

                {record.objective && (
                  <div>
                    <h4 className='mb-2 font-semibold text-sm'>Objective</h4>
                    <p className='text-muted-foreground text-sm'>{record.objective}</p>
                  </div>
                )}

                {record.assessment && (
                  <div>
                    <h4 className='mb-2 font-semibold text-sm'>Assessment</h4>
                    <p className='text-muted-foreground text-sm'>{record.assessment}</p>
                  </div>
                )}

                {record.plan && (
                  <div>
                    <h4 className='mb-2 font-semibold text-sm'>Plan</h4>
                    <p className='text-muted-foreground text-sm'>{record.plan}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vital Signs Tab */}
        <TabsContent value='vitals'>
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>Patient vital signs recorded during encounter</CardDescription>
            </CardHeader>
            <CardContent>
              {record.vitalSigns ? (
                <div className='grid gap-4 md:grid-cols-3'>
                  {record.vitalSigns.bodyTemperature && (
                    <div>
                      <p className='font-medium text-sm'>Temperature</p>
                      <p className='font-bold text-2xl'>{record.vitalSigns.bodyTemperature}°C</p>
                    </div>
                  )}

                  {record.vitalSigns.systolic && record.vitalSigns.diastolic && (
                    <div>
                      <p className='font-medium text-sm'>Blood Pressure</p>
                      <p className='font-bold text-2xl'>
                        {record.vitalSigns.systolic}/{record.vitalSigns.diastolic}
                      </p>
                      <p className='text-muted-foreground text-xs'>mmHg</p>
                    </div>
                  )}

                  {record.vitalSigns.heartRate && (
                    <div>
                      <p className='font-medium text-sm'>Heart Rate</p>
                      <p className='font-bold text-2xl'>{record.vitalSigns.heartRate}</p>
                      <p className='text-muted-foreground text-xs'>bpm</p>
                    </div>
                  )}

                  {record.vitalSigns.respiratoryRate && (
                    <div>
                      <p className='font-medium text-sm'>Respiratory Rate</p>
                      <p className='font-bold text-2xl'>{record.vitalSigns.respiratoryRate}</p>
                      <p className='text-muted-foreground text-xs'>breaths/min</p>
                    </div>
                  )}

                  {record.vitalSigns.oxygenSaturation && (
                    <div>
                      <p className='font-medium text-sm'>O2 Saturation</p>
                      <p className='font-bold text-2xl'>{record.vitalSigns.oxygenSaturation}%</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>No vital signs recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value='prescriptions'>
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>Medications prescribed during this encounter</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm'>No prescriptions recorded</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Tests Tab */}
        <TabsContent value='labs'>
          <Card>
            <CardHeader>
              <CardTitle>Lab Tests</CardTitle>
              <CardDescription>Laboratory tests ordered during this encounter</CardDescription>
            </CardHeader>
            <CardContent>
              {record.labRequest ? (
                <div>
                  <h4 className='mb-2 font-semibold text-sm'>Lab Request</h4>
                  <p className='text-muted-foreground text-sm'>{record.labRequest}</p>
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>No lab tests ordered</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
