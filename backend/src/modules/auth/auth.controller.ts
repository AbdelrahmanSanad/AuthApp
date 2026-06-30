import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CookieOptions, Response } from 'express';
import { AppConfig } from '../../config/configuration';
import { AuthResult, AuthService } from './auth.service';
import { REFRESH_COOKIE_PATH, REFRESH_TOKEN_COOKIE } from './auth.constants';
import { CurrentRefresh, CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshContext } from './strategies/jwt-refresh.strategy';
import { AuthenticatedUser } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('signup')
  @ApiOperation({ summary: 'Register a new account; sets the refresh cookie' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered' })
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.respondWithSession(await this.authService.signup(dto), res);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate; sets the refresh cookie' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.respondWithSession(await this.authService.signin(dto), res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new access token' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid refresh token' })
  async refresh(
    @CurrentRefresh() refresh: RefreshContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.refresh({
      id: refresh.id,
      email: refresh.email,
      name: refresh.name,
    });
    return this.respondWithSession(result, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Invalidate the refresh token and clear the cookie' })
  @ApiResponse({ status: HttpStatus.OK })
  async logout(
    @CurrentRefresh() refresh: RefreshContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    await this.authService.logout(refresh.id);
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.clearCookieOptions());
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user (protected)' })
  @ApiResponse({ status: HttpStatus.OK, type: UserProfileDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid token' })
  me(@CurrentUser() user: AuthenticatedUser): UserProfileDto {
    return user;
  }

  /** Sets the refresh cookie and returns only the access token + user in the body. */
  private respondWithSession(result: AuthResult, res: Response): AuthResponseDto {
    res.cookie(REFRESH_TOKEN_COOKIE, result.tokens.refreshToken, this.cookieOptions());
    return { accessToken: result.tokens.accessToken, user: result.user };
  }

  private cookieOptions(): CookieOptions {
    const cookie = this.config.get('cookie', { infer: true });
    const days = this.config.get('jwt', { infer: true }).refreshExpiresInDays;
    return {
      httpOnly: true,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: REFRESH_COOKIE_PATH,
      maxAge: days * 24 * 60 * 60 * 1000,
    };
  }

  private clearCookieOptions(): CookieOptions {
    const cookie = this.config.get('cookie', { infer: true });
    return {
      httpOnly: true,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: REFRESH_COOKIE_PATH,
    };
  }
}
