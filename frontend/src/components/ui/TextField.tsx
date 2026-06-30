import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Optional helper text shown when there is no error (e.g. a password policy). */
  hint?: string;
}

/**
 * Labeled input wired for react-hook-form (forwards ref) with inline error/hint
 * and accessible `aria-invalid`/`aria-describedby` wiring.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = !error && hint ? `${inputId}-hint` : undefined;

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
        <input
          {...props}
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? hintId}
          className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 ${
            error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {error ? (
          <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
              {hint}
            </p>
          )
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
