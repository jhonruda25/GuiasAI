// This test verifies that the USER_REPOSITORY token and PrismaUserRepository
// can be imported and wired together without TypeScript errors.
// Full AppModule compilation is tested via `pnpm --filter backend build`.

import { USER_REPOSITORY } from '../core/domain/ports';
import { PrismaUserRepository } from '../infrastructure/database/prisma/prisma-user.repository';

describe('AppModule DI wiring', () => {
  it('exports USER_REPOSITORY token as a string', () => {
    expect(USER_REPOSITORY).toBe('USER_REPOSITORY');
  });

  it('PrismaUserRepository implements IUserRepository shape', () => {
    // Verify the class has the expected methods from the interface
    const proto = PrismaUserRepository.prototype;
    expect(typeof proto.findById).toBe('function');
    expect(typeof proto.findByEmail).toBe('function');
    expect(typeof proto.create).toBe('function');
  });
});
