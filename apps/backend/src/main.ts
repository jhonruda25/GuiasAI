import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { env } from './config/env';
import { SentryExceptionFilter } from './infrastructure/observability/sentry.filter';
import { initializeSentry } from './infrastructure/observability/sentry';

async function bootstrap() {
  initializeSentry('api');
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalFilters(new SentryExceptionFilter());
  const frontendUrl = env.FRONTEND_URL.replace(/\/$/, '');
  
  app.enableCors({
    origin: [frontendUrl, `${frontendUrl}/`],
    credentials: true,
  });
  const port = env.PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on: http://localhost:${port}`);
}
void bootstrap();
