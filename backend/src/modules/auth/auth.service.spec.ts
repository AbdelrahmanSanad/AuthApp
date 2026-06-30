import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { HashingService } from './hashing.service';

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<Pick<UsersService, 'findByEmail' | 'findByEmailWithPassword' | 'create'>>;
  let hashing: jest.Mocked<Pick<HashingService, 'hash' | 'verify'>>;

  const userDoc = {
    id: 'user-id-1',
    email: 'jane@example.com',
    name: 'Jane Doe',
    password: 'hashed-password',
  };

  beforeEach(async () => {
    users = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
    };
    hashing = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: HashingService, useValue: hashing },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('signed-token') } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('signup', () => {
    it('hashes the password and returns a token without exposing the hash', async () => {
      users.findByEmail.mockResolvedValue(null);
      hashing.hash.mockResolvedValue('hashed-password');
      users.create.mockResolvedValue(userDoc as never);

      const result = await service.signup({
        email: 'jane@example.com',
        name: 'Jane Doe',
        password: 'Str0ng!Pass',
      });

      expect(hashing.hash).toHaveBeenCalledWith('Str0ng!Pass');
      expect(result.accessToken).toBe('signed-token');
      expect(result.user).toEqual({
        id: 'user-id-1',
        email: 'jane@example.com',
        name: 'Jane Doe',
      });
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
    it('returns a token for valid credentials', async () => {
      users.findByEmailWithPassword.mockResolvedValue(userDoc as never);
      hashing.verify.mockResolvedValue(true);

      const result = await service.signin({ email: 'jane@example.com', password: 'Str0ng!Pass' });

      expect(result.accessToken).toBe('signed-token');
      expect(result.user.email).toBe('jane@example.com');
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
});
