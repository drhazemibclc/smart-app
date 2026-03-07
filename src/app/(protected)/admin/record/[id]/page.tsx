import { notFound } from 'next/navigation';

import { MedicalRecordDetail } from '../_components/medical-record-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MedicalRecordPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className='container mx-auto py-6'>
      <MedicalRecordDetail id={id} />
    </div>
  );
}
