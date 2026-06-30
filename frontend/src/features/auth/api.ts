import { api } from '@/lib/api';
import type { SigninInput, SignupInput } from './schemas';
import type { AuthResponse, User } from './types';

/** Pure API layer for auth — no React, no state, just typed HTTP calls. */
export const authApi = {
  // A 401 here means bad credentials, not an expired access token, so we opt out
  // of the refresh interceptor and let the original error reach the caller.
  async signup(input: SignupInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/signup', input, {
      skipAuthRefresh: true,
    });
    return data;
  },

  async signin(input: SigninInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/signin', input, {
      skipAuthRefresh: true,
    });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  /** Exchanges the refresh cookie for a new session (used on app load). */
  async refresh(): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/refresh', null, {
      skipAuthRefresh: true,
    });
    return data;
  },

  /** Invalidates the refresh token server-side and clears the cookie. */
  async logout(): Promise<void> {
    await api.post('/auth/logout', null, { skipAuthRefresh: true });
  },
};
