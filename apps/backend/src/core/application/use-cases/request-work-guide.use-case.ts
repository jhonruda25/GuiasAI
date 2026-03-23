import { Injectable, Inject } from '@nestjs/common';
import type {
  IWorkGuideRepository,
  IQueueProducer,
  CreateWorkGuideDto,
} from '../../domain/ports';
import { WORK_GUIDE_REPOSITORY, QUEUE_PRODUCER } from '../../domain/ports';

@Injectable()
export class RequestWorkGuideUseCase {
  constructor(
    @Inject(WORK_GUIDE_REPOSITORY)
    private readonly workGuideRepository: IWorkGuideRepository,
    @Inject(QUEUE_PRODUCER) private readonly queueProducer: IQueueProducer,
  ) {}

  async execute(dto: CreateWorkGuideDto, userId: string) {
    const workGuide = await this.workGuideRepository.create(dto, userId);

    await this.workGuideRepository.updateStatus(workGuide.id, 'GENERATING');

    await this.queueProducer.enqueueGeneration(
      workGuide.id,
      dto.topic,
      dto.targetAudience,
      dto.language,
      dto.activities,
    );

    return {
      guideId: workGuide.id,
      status: 'GENERATING',
    };
  }
}
