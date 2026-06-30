import { Navigate, Outlet } from 'react-router-dom';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';
import { useAuth } from '@/features/auth/use-auth';
import { paths } from './paths';

/** Keeps already-authenticated users away from signin/signup by redirecting home. */
export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  return status === 'authenticated' ? <Navigate to={paths.home} replace /> : <Outlet />;
}
