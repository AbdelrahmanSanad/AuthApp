import { Navigate, Outlet } from 'react-router-dom';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';
import { useAuth } from '@/features/auth/use-auth';
import { paths } from './paths';

/** Renders child routes only for authenticated users; otherwise redirects to signin. */
export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  return status === 'authenticated' ? <Outlet /> : <Navigate to={paths.signin} replace />;
}
