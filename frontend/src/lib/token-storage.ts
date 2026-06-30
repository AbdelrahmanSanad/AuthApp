const TOKEN_KEY = 'eg.accessToken';

/**
 * Single source of truth for where the JWT lives. Centralizing it keeps the
 * storage choice (localStorage today) swappable without touching call sites.
 */
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
