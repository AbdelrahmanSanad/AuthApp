import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new account and receive an access token' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered' })
  signup(@Body() dto: SignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  signin(@Body() dto: SigninDto): Promise<AuthResponseDto> {
    return this.authService.signin(dto);
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
}
