import { Injectable } from '@nestjs/common';
import type { User as PrismaUser } from '@prisma/client';
import type { IUserRepository, UserEntity } from '../../../core/domain/ports';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async create(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }): Promise<UserEntity> {
    const result = await this.prisma.user.create({ data });
    return this.mapToEntity(result);
  }

  private mapToEntity(data: PrismaUser): UserEntity {
    return {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      passwordHash: data.passwordHash,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
