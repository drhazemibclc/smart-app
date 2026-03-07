// src/modules/billing/components/new-payment-button.tsx
'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import { PaymentForm } from './payment-form';

export function NewPaymentButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      onOpenChange={setOpen}
      open={open}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Payment
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Create New Payment</DialogTitle>
          <DialogDescription>Add a new payment record for a patient</DialogDescription>
        </DialogHeader>
        <PaymentForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
