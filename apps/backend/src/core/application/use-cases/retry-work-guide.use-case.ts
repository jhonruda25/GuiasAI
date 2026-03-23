import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IWorkGuideRepository, IQueueProducer } from '../../domain/ports';
import { WORK_GUIDE_REPOSITORY, QUEUE_PRODUCER } from '../../domain/ports';

@Injectable()
export class RetryWorkGuideUseCase {
  constructor(
    @Inject(WORK_GUIDE_REPOSITORY)
    private readonly workGuideRepository: IWorkGuideRepository,
    @Inject(QUEUE_PRODUCER) private readonly queueProducer: IQueueProducer,
  ) {}

  async execute(id: string, userId: string) {
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

    // Re-enqueue for generation
    await this.queueProducer.enqueueGeneration(
      workGuide.id,
      workGuide.topic,
      workGuide.targetAudience,
      workGuide.language,
    );

    return {
      guideId: workGuide.id,
      status: 'GENERATING',
    };
  }
}
