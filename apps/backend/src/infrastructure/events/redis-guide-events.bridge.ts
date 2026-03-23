import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisGuideEventsBridge implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisGuideEventsBridge.name);
  private readonly pattern = 'guide.updated.*';
  private readonly handlePatternMessage = (
    _pattern: string,
    channel: string,
    message: string,
  ) => {
    try {
      this.eventEmitter.emit(channel, JSON.parse(message));
    } catch (error) {
      this.logger.error('Failed to bridge Redis event', error);
    }
  };

  constructor(
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.redisService.subscriber.psubscribe(this.pattern);
    this.redisService.subscriber.on('pmessage', this.handlePatternMessage);
  }

  async onModuleDestroy() {
    this.redisService.subscriber.off('pmessage', this.handlePatternMessage);
    await this.redisService.subscriber
      .punsubscribe(this.pattern)
      .catch(() => null);
  }
}
