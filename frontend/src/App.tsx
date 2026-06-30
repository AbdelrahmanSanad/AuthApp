import { Navigate, Route, Routes } from 'react-router-dom';
import { SignInPage } from '@/features/auth/pages/SignInPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { HomePage } from '@/features/home/pages/HomePage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';
import { paths } from '@/routes/paths';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={paths.signin} element={<SignInPage />} />
        <Route path={paths.signup} element={<SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={paths.home} element={<HomePage />} />
      </Route>

      <Route path="*" element={<Navigate to={paths.home} replace />} />
    </Routes>
  );
}
