import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { HashingService } from './hashing.service';

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<
    Pick<UsersService, 'findByEmail' | 'findByEmailWithPassword' | 'create' | 'setRefreshTokenHash'>
  >;
  let hashing: jest.Mocked<Pick<HashingService, 'hash' | 'verify'>>;

  const userDoc = {
    id: 'user-id-1',
    email: 'jane@example.com',
    name: 'Jane Doe',
    password: 'hashed-password',
  };

  const jwtConfig = {
    accessSecret: 'access-secret',
    accessExpiresInMinutes: 15,
    refreshSecret: 'refresh-secret',
    refreshExpiresInDays: 7,
  };

  beforeEach(async () => {
    users = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
      setRefreshTokenHash: jest.fn().mockResolvedValue(undefined),
    };
    hashing = {
      hash: jest.fn().mockResolvedValue('hashed-value'),
      verify: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: HashingService, useValue: hashing },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('signed-token') } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(jwtConfig) } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('signup', () => {
    it('hashes the password, stores a refresh hash, and returns tokens without the password', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue(userDoc as never);

      const result = await service.signup({
        email: 'jane@example.com',
        name: 'Jane Doe',
        password: 'Str0ng!Pass',
      });

      expect(hashing.hash).toHaveBeenCalledWith('Str0ng!Pass');
      expect(users.setRefreshTokenHash).toHaveBeenCalledWith('user-id-1', 'hashed-value');
      expect(result.tokens).toEqual({ accessToken: 'signed-token', refreshToken: 'signed-token' });
      expect(result.user).toEqual({ id: 'user-id-1', email: 'jane@example.com', name: 'Jane Doe' });
      expect(result.user).not.toHaveProperty('password');
    });

    it('rejects a duplicate email', async () => {
      users.findByEmail.mockResolvedValue(userDoc as never);

      await expect(
        service.signup({ email: 'jane@example.com', name: 'Jane Doe', password: 'Str0ng!Pass' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('signin', () => {
    it('returns tokens for valid credentials', async () => {
      users.findByEmailWithPassword.mockResolvedValue(userDoc as never);
      hashing.verify.mockResolvedValue(true);

      const result = await service.signin({ email: 'jane@example.com', password: 'Str0ng!Pass' });

      expect(result.tokens.accessToken).toBe('signed-token');
      expect(users.setRefreshTokenHash).toHaveBeenCalled();
    });

    it('rejects an unknown email', async () => {
      users.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.signin({ email: 'nobody@example.com', password: 'whatever' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      users.findByEmailWithPassword.mockResolvedValue(userDoc as never);
      hashing.verify.mockResolvedValue(false);

      await expect(
        service.signin({ email: 'jane@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('rotates the refresh token and returns a new pair', async () => {
      const result = await service.refresh({
        id: 'user-id-1',
        email: 'jane@example.com',
        name: 'Jane Doe',
      });

      expect(users.setRefreshTokenHash).toHaveBeenCalledWith('user-id-1', 'hashed-value');
      expect(result.tokens.accessToken).toBe('signed-token');
    });
  });

  describe('logout', () => {
    it('clears the stored refresh hash', async () => {
      await service.logout('user-id-1');
      expect(users.setRefreshTokenHash).toHaveBeenCalledWith('user-id-1', null);
    });
  });
});
