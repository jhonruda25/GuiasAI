import 'dotenv/config';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ProcessWorkGuideGenerationUseCase } from './core/application/use-cases/process-work-guide.use-case';
import { RequestWorkGuideUseCase } from './core/application/use-cases/request-work-guide.use-case';
import { RetryWorkGuideUseCase } from './core/application/use-cases/retry-work-guide.use-case';
import {
  AI_GENERATOR_SERVICE,
  EVENT_PUBLISHER,
  QUEUE_PRODUCER,
  USER_REPOSITORY,
  WORK_GUIDE_REPOSITORY,
} from './core/domain/ports';
import { AuthController } from './infrastructure/auth/auth.controller';
import { AuthService } from './infrastructure/auth/auth.service';
import { SessionAuthGuard } from './infrastructure/auth/session-auth.guard';
import { SessionService } from './infrastructure/auth/session.service';
import { ImageGeneratorService } from './infrastructure/ai/image-generator.service';
import { ModelFallbackStrategy } from './infrastructure/ai/model-fallback-strategy';
import { VercelAiGeneratorService } from './infrastructure/ai/vercel-ai-generator.service';
import { WorkGuidePromptBuilder } from './infrastructure/ai/work-guide-prompt-builder';
import { PrismaWorkGuideRepository } from './infrastructure/database/prisma/prisma-work-guide.repository';
import { PrismaUserRepository } from './infrastructure/database/prisma/prisma-user.repository';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { RedisEventEmitterPublisher } from './infrastructure/events/redis-event-emitter.publisher';
import { RedisGuideEventsBridge } from './infrastructure/events/redis-guide-events.bridge';
import { HealthController } from './infrastructure/http/controllers/health.controller';
import { WorkGuideController } from './infrastructure/http/controllers/work-guide.controller';
import { AppThrottlerGuard } from './infrastructure/http/guards/app-throttler.guard';
import { RedisService } from './infrastructure/redis/redis.service';
import { BullMqGuideProducer } from './infrastructure/queue/bullmq-guide.producer';
import { getRedisConnection } from './config/env';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: getRedisConnection(),
    }),
    BullModule.registerQueue({ name: 'work-guide-generation' }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
  ],
  controllers: [AuthController, HealthController, WorkGuideController],
  providers: [
    RequestWorkGuideUseCase,
    RetryWorkGuideUseCase,
    ProcessWorkGuideGenerationUseCase,
    PrismaService,
    RedisService,
    AuthService,
    SessionService,
    SessionAuthGuard,
    ImageGeneratorService,
    RedisGuideEventsBridge,
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
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
    {
      provide: WORK_GUIDE_REPOSITORY,
      useClass: PrismaWorkGuideRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: QUEUE_PRODUCER,
      useClass: BullMqGuideProducer,
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
export class AppModule {}
