let accessToken: string | null = null;

/**
 * In-memory holder for the short-lived access token. Deliberately NOT persisted
 * to localStorage/sessionStorage — it lives only for the page session and is
 * re-obtained via the refresh-token cookie on reload.
 */
export const accessTokenStore = {
  get: (): string | null => accessToken,
  set: (token: string): void => {
    accessToken = token;
  },
  clear: (): void => {
    accessToken = null;
  },
};
