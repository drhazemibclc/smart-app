import { Suspense } from 'react';

import { ChooseRole } from '@/components/auth/choose-role'; // Note: named import

export default function ChooseRolePage() {
  return (
    <Suspense fallback={<div>Loading choose role options...</div>}>
      <ChooseRole />
    </Suspense>
  );
}
