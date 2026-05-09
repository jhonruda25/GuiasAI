import { PrismaUserRepository } from '../prisma-user.repository';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    passwordHash: 'hashed-password',
    role: 'TEACHER',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new PrismaUserRepository(prismaMock as any);
  });

  describe('findById', () => {
    it('returns user entity when Prisma finds a user by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById('user-1');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        passwordHash: 'hashed-password',
        role: 'TEACHER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });
    });

    it('returns null when Prisma returns no user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns user entity when Prisma finds a user by email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        passwordHash: 'hashed-password',
        role: 'TEACHER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });
    });

    it('returns null when Prisma returns no user for email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a user and returns the entity', async () => {
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await repository.create({
        fullName: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          fullName: 'Test User',
          email: 'test@example.com',
          passwordHash: 'hashed-password',
        },
      });
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        passwordHash: 'hashed-password',
        role: 'TEACHER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });
    });
  });
});
