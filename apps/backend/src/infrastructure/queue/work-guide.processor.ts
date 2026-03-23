import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ProcessWorkGuideGenerationUseCase } from '../../core/application/use-cases/process-work-guide.use-case';

interface WorkGuideGenerationJobData {
  guideId: string;
  topic: string;
  targetAudience: string;
  language: string;
  activities?: string[];
}

@Processor('work-guide-generation')
export class WorkGuideProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkGuideProcessor.name);

  constructor(
    private readonly processWorkGuideUseCase: ProcessWorkGuideGenerationUseCase,
  ) {
    super();
  }

  async process(job: Job<WorkGuideGenerationJobData>): Promise<void> {
    this.logger.log(`Processing job ${job.id} for guide: ${job.data.guideId}`);

    const { guideId, topic, targetAudience, language, activities } = job.data;

    await this.processWorkGuideUseCase.execute(
      guideId,
      topic,
      targetAudience,
      language,
      activities,
    );
  }
}
