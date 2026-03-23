import * as Sentry from '@sentry/nextjs';

const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

function initializeRuntimeSentry() {
  if (!sentryDsn) {
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
    sendDefaultPii: false,
  });
}

export async function register() {
  initializeRuntimeSentry();
}

export const onRequestError = Sentry.captureRequestError;
