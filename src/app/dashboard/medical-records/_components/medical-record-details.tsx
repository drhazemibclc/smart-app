'use client';

import { format } from 'date-fns';
import { Activity, Calendar, Clock, Heart, Scale, Thermometer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MedicalRecords } from '@/server/db/types';

interface MedicalRecordDetailsProps {
  record: MedicalRecords;
  onClose: () => void;
}

export function MedicalRecordDetails({ record }: MedicalRecordDetailsProps) {
  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'RESTRICTED':
        return <Badge variant='destructive'>Restricted</Badge>;
      case 'SENSITIVE':
        return <Badge variant='secondary'>Sensitive</Badge>;
      default:
        return <Badge variant='outline'>Standard</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='font-semibold text-xl'>
            {record.patient?.firstName} {record.patient?.lastName}
          </h2>
          <div className='mt-1 flex items-center gap-2 text-muted-foreground text-sm'>
            <Calendar className='h-4 w-4' />
            {format(new Date(record.createdAt ?? new Date()), 'MMMM d, yyyy h:mm a')}
            {record.followUpDate && (
              <>
                <Clock className='ml-2 h-4 w-4' />
                Follow-up: {format(new Date(record.followUpDate), 'MMM d, yyyy')}
              </>
            )}
          </div>
        </div>
        <div className='flex gap-2'>
          {record.isConfidential && <Badge variant='destructive'>Confidential</Badge>}
          {getAccessLevelBadge(record.accessLevel ?? 'STANDARD')}
        </div>
      </div>

      <Separator />

      <Tabs
        className='space-y-4'
        defaultValue='soap'
      >
        <TabsList>
          <TabsTrigger value='soap'>SOAP Notes</TabsTrigger>
          <TabsTrigger value='vitals'>Vital Signs</TabsTrigger>
          <TabsTrigger value='diagnosis'>Diagnosis</TabsTrigger>
          <TabsTrigger value='plan'>Treatment Plan</TabsTrigger>
        </TabsList>

        <TabsContent
          className='space-y-4'
          value='soap'
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Subjective (S)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{record.subjective || 'No subjective notes recorded'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Objective (O)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{record.objective || 'No objective findings recorded'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Assessment (A)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{record.assessment || 'No assessment recorded'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Plan (P)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{record.plan || 'No plan recorded'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          className='space-y-4'
          value='vitals'
        >
          {record.vitalSigns && record.vitalSigns.length > 0 ? (
            <div className='grid gap-4 md:grid-cols-2'>
              {record.vitalSigns[0].bodyTemperature && (
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Thermometer className='h-4 w-4 text-red-500' />
                      Temperature
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='font-bold text-2xl'>{record.vitalSigns[0].bodyTemperature}°C</p>
                  </CardContent>
                </Card>
              )}

              {record.vitalSigns[0].heartRate && (
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Heart className='h-4 w-4 text-red-500' />
                      Heart Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='font-bold text-2xl'>{record.vitalSigns[0].heartRate} bpm</p>
                  </CardContent>
                </Card>
              )}

              {record.vitalSigns[0].respiratoryRate && (
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Activity className='h-4 w-4 text-blue-500' />
                      Respiratory Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='font-bold text-2xl'>{record.vitalSigns[0].respiratoryRate} /min</p>
                  </CardContent>
                </Card>
              )}

              {record.vitalSigns[0].oxygenSaturation && (
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Activity className='h-4 w-4 text-green-500' />
                      O2 Saturation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='font-bold text-2xl'>{record.vitalSigns[0].oxygenSaturation}%</p>
                  </CardContent>
                </Card>
              )}

              {record.vitalSigns[0].systolic && record.vitalSigns[0].diastolic && (
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Activity className='h-4 w-4 text-purple-500' />
                      Blood Pressure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='font-bold text-2xl'>
                      {record.vitalSigns[0].systolic}/{record.vitalSigns[0].diastolic} mmHg
                    </p>
                  </CardContent>
                </Card>
              )}

              {record.vitalSigns[0].growthRecords && record.vitalSigns[0].growthRecords.length > 0 && (
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Scale className='h-4 w-4 text-gray-500' />
                      Weight / Height
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='font-bold text-2xl'>
                      {record.vitalSigns[0].growthRecords[0].weight &&
                        `${record.vitalSigns[0].growthRecords[0].weight} kg`}
                      {record.vitalSigns[0].growthRecords[0].height &&
                        ` / ${record.vitalSigns[0].growthRecords[0].height} cm`}
                    </p>
                    {record.vitalSigns[0].growthRecords[0].bmi && (
                      <p className='text-muted-foreground text-sm'>
                        BMI: {Number(record.vitalSigns[0].growthRecords[0].bmi).toFixed(1)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <p className='text-muted-foreground'>No vital signs recorded</p>
          )}
        </TabsContent>

        <TabsContent
          className='space-y-4'
          value='diagnosis'
        >
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{record.diagnosis || 'No diagnosis recorded'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{record.symptoms || 'No symptoms recorded'}</p>
            </CardContent>
          </Card>

          {record.labRequest && (
            <Card>
              <CardHeader>
                <CardTitle>Lab Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-wrap'>{record.labRequest}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent
          className='space-y-4'
          value='plan'
        >
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap'>{record.treatmentPlan || 'No treatment plan recorded'}</p>
            </CardContent>
          </Card>

          {record.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-wrap'>{record.notes}</p>
              </CardContent>
            </Card>
          )}

          {record.followUpDate && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  Follow-up Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='font-medium text-lg'>{format(new Date(record.followUpDate), 'MMMM d, yyyy')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
