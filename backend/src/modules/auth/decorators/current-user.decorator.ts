import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../strategies/jwt.strategy';
import { RefreshContext } from '../strategies/jwt-refresh.strategy';

/** Extracts the authenticated user (set by JwtStrategy) from the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);

/** Extracts the refresh context (user + raw token) set by JwtRefreshStrategy. */
export const CurrentRefresh = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RefreshContext => {
    const request = ctx.switchToHttp().getRequest<Request & { user: RefreshContext }>();
    return request.user;
  },
);
