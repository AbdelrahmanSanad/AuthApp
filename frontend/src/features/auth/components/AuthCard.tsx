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
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
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
