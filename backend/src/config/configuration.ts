/**
 * Strongly-typed application configuration assembled from validated env vars.
 * Consumed via `ConfigService<AppConfig, true>` for autocomplete and type safety.
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigin: string[];
  mongodbUri: string;
  jwt: {
    accessSecret: string;
    accessExpiresInMinutes: number;
    refreshSecret: string;
    refreshExpiresInDays: number;
  };
  cookie: {
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
  };
  throttle: {
    ttl: number;
    limit: number;
  };
}

const toBool = (value: string | undefined, fallback: boolean): boolean =>
  value === undefined ? fallback : value === 'true';

export default (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return {
    nodeEnv,
    port: parseInt(process.env.PORT ?? '3000', 10),
    corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    mongodbUri: process.env.MONGODB_URI as string,
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET as string,
      accessExpiresInMinutes: parseInt(process.env.JWT_ACCESS_EXPIRES_IN_MINUTES ?? '15', 10),
      refreshSecret: process.env.JWT_REFRESH_SECRET as string,
      refreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? '7', 10),
    },
    cookie: {
      // Default to secure cookies in production; disable over plain HTTP (local/dev).
      secure: toBool(process.env.COOKIE_SECURE, nodeEnv === 'production'),
      sameSite: (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') ?? 'lax',
    },
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    },
  };
};
