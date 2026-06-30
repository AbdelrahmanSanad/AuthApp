import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

enum SameSite {
  Lax = 'lax',
  Strict = 'strict',
  None = 'none',
}

/**
 * Schema validated at boot. A misconfigured environment fails fast with a clear
 * message instead of surfacing as a confusing runtime error later.
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsString()
  MONGODB_URI!: string;

  @IsString()
  @MinLength(16, { message: 'JWT_ACCESS_SECRET must be at least 16 characters long' })
  JWT_ACCESS_SECRET!: string;

  @IsNumber()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN_MINUTES?: number;

  @IsString()
  @MinLength(16, { message: 'JWT_REFRESH_SECRET must be at least 16 characters long' })
  JWT_REFRESH_SECRET!: string;

  @IsNumber()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN_DAYS?: number;

  @IsBooleanString()
  @IsOptional()
  COOKIE_SECURE?: string;

  @IsEnum(SameSite)
  @IsOptional()
  COOKIE_SAMESITE?: SameSite;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL?: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT?: number;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .join('\n')}`,
    );
  }

  return validated;
}
