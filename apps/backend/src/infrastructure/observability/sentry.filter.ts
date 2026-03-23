import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Sentry } from './sentry';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof Error) {
      Sentry.captureException(exception, {
        tags: {
          path: request.path,
          method: request.method,
        },
      });
    } else {
      Sentry.captureMessage('Non-error exception captured', {
        level: 'error',
        extra: { exception },
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      response
        .status(status)
        .json(
          typeof payload === 'string'
            ? { statusCode: status, message: payload }
            : payload,
        );
      return;
    }

    this.logger.error('Unhandled exception', exception);
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
