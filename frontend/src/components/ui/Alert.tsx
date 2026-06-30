import { cn } from '@/lib/cn';

type AlertVariant = 'error' | 'info';

const variantStyles: Record<AlertVariant, string> = {
  error:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
  info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200',
};

interface AlertProps {
  message: string;
  variant?: AlertVariant;
}

/** Inline notice. Errors are announced assertively; info politely. */
export function Alert({ message, variant = 'error' }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn('rounded-md border px-3 py-2 text-sm', variantStyles[variant])}
    >
      {message}
    </div>
  );
}
