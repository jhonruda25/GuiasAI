import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { IQueueProducer } from '../../core/domain/ports';

@Injectable()
export class BullMqGuideProducer implements IQueueProducer {
  private readonly logger = new Logger(BullMqGuideProducer.name);

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
    this.logger.log(
      `Enqueuing work guide ${guideId} for topic: ${topic}, audience: ${targetAudience}, language: ${language}`,
    );

    const job = await this.queue.add(
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

    this.logger.log(`Guide ${guideId} enqueued as BullMQ job ${job.id}`);
  }
}
