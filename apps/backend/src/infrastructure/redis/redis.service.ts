import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { getRedisConnection } from '../../config/env';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly pubClient = new Redis(getRedisConnection());
  private readonly subClient = new Redis(getRedisConnection());

  get publisher() {
    return this.pubClient;
  }

  get subscriber() {
    return this.subClient;
  }

  async ping() {
    await this.pubClient.ping();
  }

  async onModuleDestroy() {
    await Promise.all([this.pubClient.quit(), this.subClient.quit()]).catch(
      () => null,
    );
  }
}
