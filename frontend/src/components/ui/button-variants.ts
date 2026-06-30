import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Single source of truth for button styling. Adding a new variant is a one-line
 * change here — no branching in the component (open for extension, closed for
 * modification). Kept in its own module so the component file stays a pure
 * component export (React Fast Refresh friendly).
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-900',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        secondary:
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
        outline:
          'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
