import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository, UserEntity } from '../../../core/domain/ports';
import type { SessionService } from '../session.service';
import type { SessionUser } from '../auth.types';
import * as bcryptjs from 'bcryptjs';

// Set required env vars before importing auth.service (which loads env.ts at module level)
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.SESSION_TTL_HOURS = '24';
process.env.AUTH_BCRYPT_ROUNDS = '10';
process.env.NODE_ENV = 'test';

jest.mock('bcryptjs');

import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepoMock: jest.Mocked<IUserRepository>;
  let sessionServiceMock: jest.Mocked<SessionService>;

  const mockUserEntity: UserEntity = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    passwordHash: 'hashed-password',
    role: 'TEACHER',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const mockSession = {
    token: 'session-token-abc',
    expiresAt: new Date('2024-02-01'),
  };

  const mockSessionUser: SessionUser = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'TEACHER',
  };

  beforeEach(() => {
    userRepoMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    sessionServiceMock = {
      createSession: jest.fn(),
      serializeUser: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    service = new AuthService(userRepoMock, sessionServiceMock);

    (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    sessionServiceMock.serializeUser.mockReturnValue(mockSessionUser);
  });

  describe('register', () => {
    it('throws ConflictException when email already exists', async () => {
      userRepoMock.findByEmail.mockResolvedValue(mockUserEntity);

      await expect(
        service.register('Test User', 'test@example.com', 'password123'),
      ).rejects.toThrow(ConflictException);

      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepoMock.create).not.toHaveBeenCalled();
    });

    it('creates user and session when email is available', async () => {
      userRepoMock.findByEmail.mockResolvedValue(null);
      userRepoMock.create.mockResolvedValue(mockUserEntity);
      sessionServiceMock.createSession.mockResolvedValue(mockSession);

      const result = await service.register(
        'Test User',
        'test@example.com',
        'password123',
      );

      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepoMock.create).toHaveBeenCalledWith({
        fullName: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      expect(sessionServiceMock.createSession).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({
        user: mockSessionUser,
        session: mockSession,
      });
    });

    it('normalizes email to lowercase and trims whitespace', async () => {
      userRepoMock.findByEmail.mockResolvedValue(null);
      userRepoMock.create.mockResolvedValue(mockUserEntity);
      sessionServiceMock.createSession.mockResolvedValue(mockSession);

      await service.register('  Test User  ', '  TEST@Example.COM  ', 'pass');

      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Test User',
          email: 'test@example.com',
        }),
      );
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      userRepoMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('unknown@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepoMock.findByEmail).toHaveBeenCalledWith(
        'unknown@example.com',
      );
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      userRepoMock.findByEmail.mockResolvedValue(mockUserEntity);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('creates session when credentials are valid', async () => {
      userRepoMock.findByEmail.mockResolvedValue(mockUserEntity);
      sessionServiceMock.createSession.mockResolvedValue(mockSession);

      const result = await service.login('test@example.com', 'password123');

      expect(bcryptjs.compare).toHaveBeenCalledWith(
        'password123',
        mockUserEntity.passwordHash,
      );
      expect(sessionServiceMock.createSession).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({
        user: mockSessionUser,
        session: mockSession,
      });
    });

    it('normalizes email to lowercase and trims whitespace', async () => {
      userRepoMock.findByEmail.mockResolvedValue(mockUserEntity);
      sessionServiceMock.createSession.mockResolvedValue(mockSession);

      await service.login('  TEST@Example.COM  ', 'password123');

      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
});
