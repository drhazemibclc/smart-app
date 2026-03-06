import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings'
};

export default function SettingsPage() {
  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-6 font-bold text-3xl'>Settings</h1>
      <p className='text-muted-foreground'>Settings page coming soon...</p>
    </div>
  );
}
