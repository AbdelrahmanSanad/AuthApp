import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { accessTokenStore } from './access-token-store';

/** Broadcast when refreshing fails so the app can log the user out and redirect. */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Skip the 401 -> refresh interceptor (used by the refresh/logout calls). */
    skipAuthRefresh?: boolean;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Required so the HttpOnly refresh cookie is sent and received cross-origin.
  withCredentials: true,
});

// Attach the in-memory access token to every outgoing request when present.
api.interceptors.request.use((config) => {
  const token = accessTokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

/**
 * Single-flight refresh: concurrent 401s share one refresh request so the
 * rotating refresh token is only consumed once.
 */
export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<{ accessToken: string }>('/auth/refresh', null, { skipAuthRefresh: true })
      .then((response) => {
        accessTokenStore.set(response.data.accessToken);
        return response.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// On 401, transparently refresh the access token once and replay the request.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.skipAuthRefresh
    ) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        accessTokenStore.clear();
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

interface ApiErrorBody {
  message?: string | string[];
}

/** Turns an Axios error into a single human-readable message for the UI. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message[0] ?? fallback;
    }
    if (typeof message === 'string') {
      return message;
    }
  }
  return fallback;
}
