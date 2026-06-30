import { api } from '@/lib/api';
import type { SigninInput, SignupInput } from './schemas';
import type { AuthResponse, User } from './types';

/** Pure API layer for auth — no React, no state, just typed HTTP calls. */
export const authApi = {
  async signup(input: SignupInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/signup', input);
    return data;
  },

  async signin(input: SigninInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/signin', input);
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
