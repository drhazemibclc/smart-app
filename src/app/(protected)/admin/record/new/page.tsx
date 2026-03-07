import { EncounterForm } from '../_components/encounter-form';

export default function NewEncounterPage() {
  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='font-bold text-3xl tracking-tight'>New Encounter</h1>
        <p className='text-muted-foreground'>Create a new patient encounter and medical record</p>
      </div>
      <EncounterForm />
    </div>
  );
}
