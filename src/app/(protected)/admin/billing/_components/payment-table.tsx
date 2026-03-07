// src/modules/billing/components/payments-table.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, getPaymentMethodIcon, getPaymentStatusColor } from '@/utils/bill';
import { trpc } from '@/utils/trpc';

interface PaymentsTableProps {
  payments: Array<{
    id: string;
    amount: number | null;
    status: string;
    paymentMethod: string;
    billDate: Date;
    dueDate: Date | null;
    patient: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
    appointment: {
      doctor: { name: string } | null;
    } | null;
  }>;
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation(
    trpc.Payment.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Payment deleted successfully');
        queryClient.invalidateQueries(trpc.Payment.getByClinic.queryFilter());
        queryClient.invalidateQueries(trpc.Payment.getStats.queryFilter());
        queryClient.invalidateQueries(trpc.Payment.getOverdue.queryFilter());
        setDeleteId(null);
      },
      onError: error => {
        toast.error(error.message);
      }
    })
  );

  const processPaymentMutation = useMutation(
    trpc.Payment.processPayment.mutationOptions({
      onSuccess: () => {
        toast.success('Payment processed successfully');
        queryClient.invalidateQueries(trpc.Payment.getByClinic.queryFilter());
        queryClient.invalidateQueries(trpc.Payment.getStats.queryFilter());
        queryClient.invalidateQueries(trpc.Payment.getOverdue.queryFilter());
      },
      onError: error => {
        toast.error(error.message);
      }
    })
  );

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleProcessPayment = (id: string) => {
    processPaymentMutation.mutate(id);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map(payment => (
            <TableRow key={payment.id}>
              <TableCell>{format(new Date(payment.billDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <Link
                  className='font-medium hover:underline'
                  href={`/patients/${payment.patient?.id}`}
                >
                  {payment.patient?.firstName} {payment.patient?.lastName}
                </Link>
              </TableCell>
              <TableCell>{payment.appointment?.doctor?.name || 'N/A'}</TableCell>
              <TableCell className='font-medium'>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>
                <span className='text-2xl'>{getPaymentMethodIcon(payment.paymentMethod)}</span>
              </TableCell>
              <TableCell>
                <Badge className={getPaymentStatusColor(payment.status)}>{payment.status}</Badge>
              </TableCell>
              <TableCell>{payment.dueDate ? format(new Date(payment.dueDate), 'MMM dd, yyyy') : 'N/A'}</TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className='h-8 w-8 p-0'
                      variant='ghost'
                    >
                      <span className='sr-only'>Open menu</span>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/billing/${payment.id}`)}>
                      <Eye className='mr-2 h-4 w-4' />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/billing/${payment.id}/edit`)}>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                    {payment.status !== 'PAID' && (
                      <DropdownMenuItem onClick={() => handleProcessPayment(payment.id)}>
                        <CheckCircle className='mr-2 h-4 w-4' />
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => setDeleteId(payment.id)}
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

      <AlertDialog
        onOpenChange={() => setDeleteId(null)}
        open={!!deleteId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-600 hover:bg-red-700'
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
