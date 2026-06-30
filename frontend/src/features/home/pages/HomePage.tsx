import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/use-auth';

/** Returns up to two initials for a name, e.g. "Jane Doe" -> "JD". */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function HomePage() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    logout();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-lg space-y-6 rounded-xl bg-white p-8 text-center shadow-md dark:bg-gray-800">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
          {user ? getInitials(user.name) : ''}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 sm:text-3xl">
            Welcome, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You are signed in as{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">{user?.email}</span>.
          </p>
        </div>
        <div className="mx-auto max-w-xs">
          <Button
            type="button"
            variant="danger"
            fullWidth
            loading={loggingOut}
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </div>
    </main>
  );
}
