import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { initializeSentry } from './infrastructure/observability/sentry';

async function bootstrap() {
  initializeSentry('worker');
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.enableShutdownHooks();
  console.log('Work guide worker is running');
}

void bootstrap();
