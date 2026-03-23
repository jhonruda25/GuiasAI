import * as Sentry from '@sentry/node';
import { env } from '../../config/env';

let initialized = false;

export function initializeSentry(serviceName: 'api' | 'worker') {
  if (initialized || !env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1,
    sendDefaultPii: false,
    serverName: `guiasai-${serviceName}`,
  });

  initialized = true;
}

export { Sentry };
