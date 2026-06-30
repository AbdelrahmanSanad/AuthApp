import axios, { AxiosError } from 'axios';
import { tokenStorage } from './token-storage';

/** Broadcast when the API rejects our token so the app can log the user out. */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token to every outgoing request when present.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Expired/invalid tokens are cleared and the app is notified to redirect.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
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
