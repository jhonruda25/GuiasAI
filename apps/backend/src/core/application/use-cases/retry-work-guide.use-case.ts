import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IWorkGuideRepository, IQueueProducer } from '../../domain/ports';
import { WORK_GUIDE_REPOSITORY, QUEUE_PRODUCER } from '../../domain/ports';

@Injectable()
export class RetryWorkGuideUseCase {
  private readonly logger = new Logger(RetryWorkGuideUseCase.name);

  constructor(
    @Inject(WORK_GUIDE_REPOSITORY)
    private readonly workGuideRepository: IWorkGuideRepository,
    @Inject(QUEUE_PRODUCER) private readonly queueProducer: IQueueProducer,
  ) {}

  async execute(id: string, userId: string) {
    this.logger.log(`Retry requested for work guide ${id} by user ${userId}`);

    const workGuide = await this.workGuideRepository.findByIdForUser(
      id,
      userId,
    );

    if (!workGuide) {
      throw new NotFoundException('Work guide not found');
    }

    if (workGuide.status !== 'FAILED') {
      throw new BadRequestException('Only failed work guides can be retried');
    }

    // Update status back to GENERATING and clear error
    await this.workGuideRepository.updateStatus(
      id,
      'GENERATING',
      null,
      undefined,
      '',
    );

    this.logger.log(`Work guide ${workGuide.id} reset to GENERATING for retry`);

    // Re-enqueue for generation
    await this.queueProducer.enqueueGeneration(
      workGuide.id,
      workGuide.topic,
      workGuide.targetAudience,
      workGuide.language,
    );

    this.logger.log(`Work guide ${workGuide.id} re-enqueued for retry`);

    return {
      guideId: workGuide.id,
      status: 'GENERATING',
    };
  }
}
