// src/app/(protected)/prescriptions/components/PrescriptionStatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PrescriptionStatusBadgeProps {
  status: string;
  className?: string;
}

export function PrescriptionStatusBadge({ status, className }: PrescriptionStatusBadgeProps) {
  const variants: Record<string, { label: string; className: string }> = {
    active: {
      label: 'Active',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    },
    completed: {
      label: 'Completed',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
  };

  const variant = variants[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  };

  return (
    <Badge
      className={cn(variant.className, className)}
      variant='outline'
    >
      {variant.label}
    </Badge>
  );
}
