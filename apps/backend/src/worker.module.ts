import 'dotenv/config';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ProcessWorkGuideGenerationUseCase } from './core/application/use-cases/process-work-guide.use-case';
import {
  AI_GENERATOR_SERVICE,
  EVENT_PUBLISHER,
  WORK_GUIDE_REPOSITORY,
} from './core/domain/ports';
import { ImageGeneratorService } from './infrastructure/ai/image-generator.service';
import { VercelAiGeneratorService } from './infrastructure/ai/vercel-ai-generator.service';
import { PrismaWorkGuideRepository } from './infrastructure/database/prisma/prisma-work-guide.repository';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { RedisEventEmitterPublisher } from './infrastructure/events/redis-event-emitter.publisher';
import { RedisService } from './infrastructure/redis/redis.service';
import { WorkGuideProcessor } from './infrastructure/queue/work-guide.processor';
import { getRedisConnection } from './config/env';

@Module({
  imports: [
    BullModule.forRoot({
      connection: getRedisConnection(),
    }),
    BullModule.registerQueue({ name: 'work-guide-generation' }),
  ],
  providers: [
    ProcessWorkGuideGenerationUseCase,
    PrismaService,
    RedisService,
    ImageGeneratorService,
    WorkGuideProcessor,
    {
      provide: WORK_GUIDE_REPOSITORY,
      useClass: PrismaWorkGuideRepository,
    },
    {
      provide: AI_GENERATOR_SERVICE,
      useClass: VercelAiGeneratorService,
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: RedisEventEmitterPublisher,
    },
  ],
})
export class WorkerModule {}
