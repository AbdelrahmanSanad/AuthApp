import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../../config/configuration';
import { UsersService } from '../../users/users.service';
import { HashingService } from '../hashing.service';
import { REFRESH_TOKEN_COOKIE } from '../auth.constants';
import { AuthenticatedUser } from './jwt.strategy';

interface RefreshPayload {
  sub: string;
}

export interface RefreshContext extends AuthenticatedUser {
  /** The raw refresh token presented in the cookie, used to issue a rotation. */
  refreshToken: string;
}

const extractFromCookie = (req: Request): string | null =>
  (req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined) ?? null;

/**
 * Validates the refresh-token cookie: signature + expiry, the user still exists,
 * and the token matches the hash stored for that user (rotation/reuse check).
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService<AppConfig, true>,
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookie]),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt', { infer: true }).refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshPayload): Promise<RefreshContext> {
    const refreshToken = extractFromCookie(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);
    if (!user?.hashedRefreshToken) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    const matches = await this.hashingService.verify(user.hashedRefreshToken, refreshToken);
    if (!matches) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    return { id: user.id, email: user.email, name: user.name, refreshToken };
  }
}
