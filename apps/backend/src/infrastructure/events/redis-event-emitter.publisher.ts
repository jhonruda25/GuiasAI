import { Injectable } from '@nestjs/common';
import type { IEventPublisher } from '../../core/domain/ports';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisEventEmitterPublisher implements IEventPublisher {
  constructor(private readonly redisService: RedisService) {}

  publishGuideUpdated(guideId: string, payload: unknown) {
    void this.redisService.publisher.publish(
      `guide.updated.${guideId}`,
      JSON.stringify(payload),
    );
  }
}
