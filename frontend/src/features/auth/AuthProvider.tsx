import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UNAUTHORIZED_EVENT } from '@/lib/api';
import { accessTokenStore } from '@/lib/access-token-store';
import { queryClient } from '@/lib/query-client';
import { authApi } from './api';
import { AuthContext, type AuthContextValue, type AuthStatus } from './context';
import type { AuthResponse, User } from './types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const didBootstrap = useRef(false);

  const login = useCallback((response: AuthResponse) => {
    accessTokenStore.set(response.accessToken);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  // Clears local session state only — used when the server session is already gone.
  const clearSession = useCallback(() => {
    accessTokenStore.clear();
    queryClient.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The refresh token may already be invalid; clearing locally is enough.
    }
    clearSession();
  }, [clearSession]);

  // Bootstrap: the access token is never persisted, so on load we try to exchange
  // the HttpOnly refresh cookie for a fresh session. Failure means logged out.
  // The ref guard avoids a double refresh under StrictMode (which would rotate twice).
  useEffect(() => {
    if (didBootstrap.current) {
      return;
    }
    didBootstrap.current = true;

    authApi
      .refresh()
      .then(login)
      .catch(() => setStatus('unauthenticated'));
  }, [login]);

  // The axios interceptor fires this when a refresh attempt ultimately fails.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession);
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
