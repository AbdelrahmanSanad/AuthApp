import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';
import { useAuth } from '@/features/auth/use-auth';
import { paths } from './paths';

/** Renders child routes only for authenticated users; otherwise redirects to signin. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'authenticated') {
    return <Outlet />;
  }

  // Remember where the user was headed so the sign-in page can explain why.
  return <Navigate to={paths.signin} replace state={{ from: location.pathname }} />;
}
