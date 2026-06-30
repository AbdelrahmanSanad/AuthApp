import { createContext } from 'react';
import type { AuthResponse, User } from './types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** Persists the token + user after a successful signin/signup. */
  login: (response: AuthResponse) => void;
  /** Clears the session locally. */
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
