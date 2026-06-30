import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AppConfig } from '../../config/configuration';
import { UsersService } from '../users/users.service';
import { UserProfileDto } from './dto/auth-response.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { HashingService } from './hashing.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  tokens: AuthTokens;
  user: UserProfileDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const password = await this.hashingService.hash(dto.password);
    const user = await this.usersService.create({ email: dto.email, name: dto.name, password });

    return this.issueSession({ id: user.id, email: user.email, name: user.name });
  }

  async signin(dto: SigninDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // Single generic message for both branches avoids leaking which field was wrong.
    if (!user || !(await this.hashingService.verify(user.password, dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueSession({ id: user.id, email: user.email, name: user.name });
  }

  /** Rotates the refresh token and issues a fresh pair for an already-verified user. */
  async refresh(user: UserProfileDto): Promise<AuthResult> {
    return this.issueSession(user);
  }

  /** Invalidates the stored refresh token so it can no longer be rotated. */
  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshTokenHash(userId, null);
  }

  /** Generates a token pair and persists the new refresh-token hash (rotation). */
  private async issueSession(user: UserProfileDto): Promise<AuthResult> {
    const tokens = this.generateTokens(user);
    const hashedRefreshToken = await this.hashingService.hash(tokens.refreshToken);
    await this.usersService.setRefreshTokenHash(user.id, hashedRefreshToken);
    return { tokens, user };
  }

  private generateTokens(user: UserProfileDto): AuthTokens {
    const jwt = this.config.get('jwt', { infer: true });
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, {
      secret: jwt.accessSecret,
      expiresIn: `${jwt.accessExpiresInMinutes}m`,
    } as JwtSignOptions);
    const refreshToken = this.jwtService.sign({ sub: user.id }, {
      secret: jwt.refreshSecret,
      expiresIn: `${jwt.refreshExpiresInDays}d`,
    } as JwtSignOptions);
    return { accessToken, refreshToken };
  }
}
