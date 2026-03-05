// src/app/(protected)/prescriptions/components/PrescriptionDetail.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { formatDateTime } from '../../../../server/db/utils';
import type { PrescriptionWithRelations } from '../../../../types/prescription';
import { PrescriptionStatusBadge } from './PrescriptionStatusBadge';

interface PrescriptionDetailProps {
  prescription: PrescriptionWithRelations;
}

export function PrescriptionDetail({ prescription }: PrescriptionDetailProps) {
  return (
    <div className='space-y-6'>
      {/* Header Info */}
      <div className='flex items-start justify-between'>
        <div>
          <h2 className='font-semibold text-2xl'>Prescription #{prescription.id.slice(-8)}</h2>
          <p className='text-muted-foreground'>Issued on {formatDateTime(prescription.issuedDate)}</p>
        </div>
        <PrescriptionStatusBadge status={prescription.status} />
      </div>

      <Separator />

      {/* Prescribed Items */}
      <div>
        <h3 className='mb-4 font-semibold text-lg'>Prescribed Medications</h3>
        <div className='space-y-4'>
          {prescription.prescribedItems?.map(item => (
            <Card key={item.id}>
              <CardContent className='pt-6'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <p className='font-medium text-muted-foreground text-sm'>Medication</p>
                    <p className='font-semibold text-lg'>{item.drug?.name}</p>
                  </div>
                  <div>
                    <p className='font-medium text-muted-foreground text-sm'>Dosage</p>
                    <p>
                      {item.dosageValue} {item.dosageUnit.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <p className='font-medium text-muted-foreground text-sm'>Frequency</p>
                    <p>{item.frequency}</p>
                  </div>
                  <div>
                    <p className='font-medium text-muted-foreground text-sm'>Duration</p>
                    <p>{item.duration}</p>
                  </div>
                  {item.drugRoute && (
                    <div>
                      <p className='font-medium text-muted-foreground text-sm'>Route</p>
                      <Badge variant='outline'>{item.drugRoute}</Badge>
                    </div>
                  )}
                  {item.instructions && (
                    <div className='md:col-span-2'>
                      <p className='font-medium text-muted-foreground text-sm'>Instructions</p>
                      <p className='mt-1'>{item.instructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Instructions */}
      {prescription.instructions && (
        <>
          <Separator />
          <div>
            <h3 className='mb-2 font-semibold text-lg'>Additional Instructions</h3>
            <p className='text-muted-foreground'>{prescription.instructions}</p>
          </div>
        </>
      )}

      {/* Validity Period */}
      {prescription.endDate && (
        <>
          <Separator />
          <div>
            <h3 className='mb-2 font-semibold text-lg'>Validity</h3>
            <p className='text-muted-foreground'>Valid until {formatDateTime(prescription.endDate)}</p>
          </div>
        </>
      )}

      {/* Associated Encounter */}
      {prescription.encounter && (
        <>
          <Separator />
          <div>
            <h3 className='mb-2 font-semibold text-lg'>Associated Diagnosis</h3>
            <p className='text-muted-foreground'>{prescription.encounter.diagnosis}</p>
          </div>
        </>
      )}
    </div>
  );
}
