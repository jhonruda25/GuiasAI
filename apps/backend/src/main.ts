import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { env } from './config/env';
import { SentryExceptionFilter } from './infrastructure/observability/sentry.filter';
import { initializeSentry } from './infrastructure/observability/sentry';

async function bootstrap() {
  initializeSentry('api');
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
          scriptSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
          imgSrc: [`'self'`, 'data:', 'https://validator.swagger.io'],
        },
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new SentryExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('GuiasAI API')
    .setDescription('The GuiasAI API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('api', app, document);
  const frontendUrl = env.FRONTEND_URL.replace(/\/$/, '');
  const origins = [frontendUrl, `${frontendUrl}/`].filter(Boolean);

  console.log(`[CORS] Allowing origins: ${origins.join(', ')}`);

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-App-Version',
    ],
  });

  const port = env.PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on: http://localhost:${port}`);
  console.log(`Environment: ${env.NODE_ENV}`);
}
void bootstrap();
