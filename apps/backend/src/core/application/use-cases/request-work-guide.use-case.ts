import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import type {
  IWorkGuideRepository,
  IQueueProducer,
  CreateWorkGuideDto,
} from '../../domain/ports';
import { WORK_GUIDE_REPOSITORY, QUEUE_PRODUCER } from '../../domain/ports';
import { getUnsupportedGenerationActivityTypes } from '../../domain/work-guide-generation';

@Injectable()
export class RequestWorkGuideUseCase {
  private readonly logger = new Logger(RequestWorkGuideUseCase.name);

  constructor(
    @Inject(WORK_GUIDE_REPOSITORY)
    private readonly workGuideRepository: IWorkGuideRepository,
    @Inject(QUEUE_PRODUCER) private readonly queueProducer: IQueueProducer,
  ) {}

  async execute(dto: CreateWorkGuideDto, userId: string) {
    const unsupportedActivities = getUnsupportedGenerationActivityTypes(
      dto.activities,
    );
    if (unsupportedActivities.length > 0) {
      throw new BadRequestException(
        `Unsupported activity types for stable generation: ${unsupportedActivities.join(', ')}`,
      );
    }

    this.logger.log(
      `Creating work guide request for user ${userId}, topic: ${dto.topic}, audience: ${dto.targetAudience}, language: ${dto.language}`,
    );

    const workGuide = await this.workGuideRepository.create(dto, userId);

    this.logger.log(`Work guide ${workGuide.id} created with status ${workGuide.status}`);

    await this.workGuideRepository.updateStatus(workGuide.id, 'GENERATING');

    this.logger.log(`Work guide ${workGuide.id} moved to GENERATING`);

    await this.queueProducer.enqueueGeneration(
      workGuide.id,
      dto.topic,
      dto.targetAudience,
      dto.language,
      dto.activities,
    );

    this.logger.log(
      `Work guide ${workGuide.id} enqueued for generation with ${dto.activities?.length ?? 0} activities`,
    );

    return {
      guideId: workGuide.id,
      status: 'GENERATING',
    };
  }
}
