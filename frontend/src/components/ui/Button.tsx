import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { buttonVariants, type ButtonVariantProps } from './button-variants';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  loading?: boolean;
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

/** Reusable button. Behaviour (loading/disabled) is decoupled from styling (CVA). */
export function Button({
  variant,
  fullWidth,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(buttonVariants({ variant, fullWidth }), className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
