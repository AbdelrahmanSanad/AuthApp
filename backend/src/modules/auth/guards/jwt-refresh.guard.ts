import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protects the refresh endpoint by requiring a valid refresh-token cookie. */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
