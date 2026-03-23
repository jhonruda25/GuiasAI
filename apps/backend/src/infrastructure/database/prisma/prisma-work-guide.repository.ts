import { Injectable } from '@nestjs/common';
import type { WorkGuide as PrismaWorkGuide } from '@prisma/client';
import type {
  IWorkGuideRepository,
  CreateWorkGuideDto,
} from '../../../core/domain/ports';
import type { WorkGuideEntity } from '../../../core/domain/entities/work-guide.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaWorkGuideRepository implements IWorkGuideRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateWorkGuideDto,
    userId: string,
  ): Promise<WorkGuideEntity> {
    const result = await this.prisma.workGuide.create({
      data: {
        userId,
        topic: data.topic,
        targetAudience: data.targetAudience,
        language: data.language,
        status: 'PENDING',
      },
    });

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<WorkGuideEntity | null> {
    const result = await this.prisma.workGuide.findUnique({
      where: { id },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<WorkGuideEntity | null> {
    const result = await this.prisma.workGuide.findFirst({
      where: { id, userId },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findAllForUser(userId: string): Promise<WorkGuideEntity[]> {
    const results = await this.prisma.workGuide.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        topic: true,
        targetAudience: true,
        language: true,
        status: true,
        globalScore: true,
        errorMessage: true,
        reviewed: true,
        reviewedBy: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return results.map((result) =>
      this.mapToEntity({ ...result, content: null }),
    );
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED',
    content?: unknown,
    globalScore?: number,
    errorMessage?: string,
  ): Promise<WorkGuideEntity> {
    const result = await this.prisma.workGuide.update({
      where: { id },
      data: {
        status,
        content: content ?? undefined,
        globalScore: globalScore ?? undefined,
        errorMessage: errorMessage ?? undefined,
      },
    });

    return this.mapToEntity(result);
  }

  async markAsReviewed(
    id: string,
    reviewerName: string,
  ): Promise<WorkGuideEntity> {
    const result = await this.prisma.workGuide.update({
      where: { id },
      data: {
        reviewed: true,
        reviewedBy: reviewerName,
        reviewedAt: new Date(),
      },
    });

    return this.mapToEntity(result);
  }

  private mapToEntity(data: PrismaWorkGuide): WorkGuideEntity {
    return {
      id: data.id,
      userId: data.userId,
      topic: data.topic,
      targetAudience: data.targetAudience,
      language: data.language,
      status: data.status,
      content: (data.content as WorkGuideEntity['content']) ?? null,
      globalScore: data.globalScore,
      errorMessage: data.errorMessage,
      reviewed: data.reviewed ?? false,
      reviewedBy: data.reviewedBy ?? null,
      reviewedAt: data.reviewedAt ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
