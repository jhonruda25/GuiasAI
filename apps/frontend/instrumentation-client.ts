import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
