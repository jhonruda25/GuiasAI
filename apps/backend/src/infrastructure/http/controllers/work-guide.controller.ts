import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  MessageEvent,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { z } from 'zod';
import { Observable, fromEvent, map } from 'rxjs';
import { Throttle } from '@nestjs/throttler';
import { RequestWorkGuideUseCase } from '../../../core/application/use-cases/request-work-guide.use-case';
import { RetryWorkGuideUseCase } from '../../../core/application/use-cases/retry-work-guide.use-case';
import type {
  CreateWorkGuideDto,
  IWorkGuideRepository,
} from '../../../core/domain/ports';
import { WORK_GUIDE_REPOSITORY } from '../../../core/domain/ports';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import type { SessionUser } from '../../auth/auth.types';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

const createWorkGuideDtoSchema = z.object({
  topic: z.string().trim().min(1),
  targetAudience: z.string().trim().min(1),
  language: z.enum(['es', 'en']),
  activities: z.array(z.string().trim().min(1)).optional(),
});

type CreateWorkGuideRequestDto = z.infer<typeof createWorkGuideDtoSchema>;

const reviewWorkGuideDtoSchema = z.object({
  reviewerName: z.string().trim().min(1),
});

type ReviewWorkGuideRequestDto = z.infer<typeof reviewWorkGuideDtoSchema>;

@Controller('api/v1/work-guides')
@UseGuards(SessionAuthGuard)
export class WorkGuideController {
  constructor(
    private readonly requestWorkGuideUseCase: RequestWorkGuideUseCase,
    private readonly retryWorkGuideUseCase: RetryWorkGuideUseCase,
    @Inject(WORK_GUIDE_REPOSITORY)
    private readonly workGuideRepository: IWorkGuideRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: SessionUser) {
    const guides = await this.workGuideRepository.findAllForUser(user.id);
    return guides.map((guide) => this.toApiGuide(guide));
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(HttpStatus.ACCEPTED)
  async create(
    @CurrentUser() user: SessionUser,
    @Body(new ZodValidationPipe(createWorkGuideDtoSchema))
    dto: CreateWorkGuideRequestDto,
  ) {
    return this.requestWorkGuideUseCase.execute(
      dto as CreateWorkGuideDto,
      user.id,
    );
  }

  @Post(':id/retry')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.ACCEPTED)
  async retry(
    @CurrentUser() user: SessionUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.retryWorkGuideUseCase.execute(id, user.id);
  }

  @Post(':id/review')
  @Throttle({ default: { ttl: 60_000, limit: 8 } })
  @HttpCode(HttpStatus.OK)
  async markAsReviewed(
    @CurrentUser() user: SessionUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(reviewWorkGuideDtoSchema))
    dto: ReviewWorkGuideRequestDto,
  ) {
    await this.assertGuideOwnedByUser(id, user.id);
    return this.workGuideRepository.markAsReviewed(id, dto.reviewerName);
  }

  @Get(':id/cover')
  async findCover(
    @CurrentUser() user: SessionUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const coverImageDataUrl = await this.workGuideRepository.findCoverByIdForUser(
      id,
      user.id,
    );

    if (!coverImageDataUrl) {
      throw new NotFoundException('Guide cover not found');
    }

    return { coverImageDataUrl };
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: SessionUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const guide = await this.assertGuideOwnedByUser(id, user.id);
    return this.toApiGuide(guide);
  }

  @Sse(':id/events')
  async sse(
    @CurrentUser() user: SessionUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Observable<MessageEvent>> {
    await this.assertGuideOwnedByUser(id, user.id);

    return fromEvent(this.eventEmitter, `guide.updated.${id}`).pipe(
      map((data) => ({ data: JSON.stringify(data) }) as MessageEvent),
    );
  }

  private async assertGuideOwnedByUser(id: string, userId: string) {
    const guide = await this.workGuideRepository.findByIdForUser(id, userId);

    if (!guide) {
      throw new NotFoundException('Guide not found');
    }

    return guide;
  }

  private toApiGuide<T extends { coverImageDataUrl?: string | null }>(guide: T) {
    const { coverImageDataUrl: _coverImageDataUrl, ...publicGuide } = guide;
    return publicGuide;
  }
}
