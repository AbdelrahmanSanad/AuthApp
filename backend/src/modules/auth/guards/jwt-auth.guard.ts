import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protects routes by requiring a valid JWT (delegates to the `jwt` strategy). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
