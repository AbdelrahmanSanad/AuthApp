import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/use-auth';

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg space-y-6 rounded-xl bg-white p-8 text-center shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-600">
          You are signed in as <span className="font-medium">{user?.email}</span>. This is a
          protected page only authenticated users can see.
        </p>
        <div className="mx-auto max-w-xs">
          <Button type="button" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
