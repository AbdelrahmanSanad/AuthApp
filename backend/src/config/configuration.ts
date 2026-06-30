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
    secret: string;
    expiresIn: string;
  };
  throttle: {
    ttl: number;
    limit: number;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongodbUri: process.env.MONGODB_URI as string,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
});
