import { Link } from 'react-router-dom';

interface AuthCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  children: React.ReactNode;
}

/** Shared centered card layout for the signin/signup screens. */
export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 sm:p-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            E
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
        {children}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {footerText}{' '}
          <Link
            to={footerLinkTo}
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
