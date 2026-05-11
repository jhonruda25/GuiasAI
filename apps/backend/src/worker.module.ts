import 'dotenv/config';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ProcessWorkGuideGenerationUseCase } from './core/application/use-cases/process-work-guide.use-case';
import {
  AI_GENERATOR_SERVICE,
  EVENT_PUBLISHER,
  WORK_GUIDE_REPOSITORY,
} from './core/domain/ports';
import { ImageGeneratorService } from './infrastructure/ai/image-generator.service';
import { ModelFallbackStrategy } from './infrastructure/ai/model-fallback-strategy';
import { VercelAiGeneratorService } from './infrastructure/ai/vercel-ai-generator.service';
import { WorkGuidePromptBuilder } from './infrastructure/ai/work-guide-prompt-builder';
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
    WorkGuidePromptBuilder,
    {
      provide: ModelFallbackStrategy,
      useFactory: () => {
        const googleProvider = createGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
        const fallbackModel =
          process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';
        return new ModelFallbackStrategy(googleProvider, primaryModel, fallbackModel);
      },
    },
    {
      provide: AI_GENERATOR_SERVICE,
      useClass: VercelAiGeneratorService,
    },
    {
      provide: WORK_GUIDE_REPOSITORY,
      useClass: PrismaWorkGuideRepository,
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: RedisEventEmitterPublisher,
    },
  ],
})
export class WorkerModule {}
