import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get('healthz')
  health() {
    return { status: 'ok' };
  }

  @Get('readyz')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    await this.redisService.ping();

    return {
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
    };
  }
}
