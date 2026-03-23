import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { IQueueProducer } from '../../core/domain/ports';

@Injectable()
export class BullMqGuideProducer implements IQueueProducer {
  constructor(
    @InjectQueue('work-guide-generation') private readonly queue: Queue,
  ) {}

  async enqueueGeneration(
    guideId: string,
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ): Promise<void> {
    await this.queue.add(
      'generate',
      {
        guideId,
        topic,
        targetAudience,
        language,
        activities,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential' as const,
          delay: 1000,
        },
      },
    );
  }
}
