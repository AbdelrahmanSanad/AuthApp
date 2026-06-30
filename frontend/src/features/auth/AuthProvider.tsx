import { useCallback, useEffect, useMemo, useState } from 'react';
import { UNAUTHORIZED_EVENT } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import { tokenStorage } from '@/lib/token-storage';
import { authApi } from './api';
import { AuthContext, type AuthContextValue, type AuthStatus } from './context';
import type { AuthResponse, User } from './types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const logout = useCallback(() => {
    tokenStorage.clear();
    queryClient.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const login = useCallback((response: AuthResponse) => {
    tokenStorage.set(response.accessToken);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  // Bootstrap: if a token is present, confirm it is still valid by loading the
  // current user. An expired/invalid token resolves to a clean logged-out state.
  useEffect(() => {
    if (!tokenStorage.get()) {
      setStatus('unauthenticated');
      return;
    }

    authApi
      .me()
      .then((current) => {
        setUser(current);
        setStatus('authenticated');
      })
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
        setStatus('unauthenticated');
      });
  }, []);

  // The axios interceptor fires this when any request hits a 401.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
