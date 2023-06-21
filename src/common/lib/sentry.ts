import * as Sentry from '@sentry/node';
import * as express from 'express';
import * as Tracing from '@sentry/tracing';
import env from '../../../config/env';

export const initSentry = (app) => {
  Sentry.init({
    dsn: env.sentryDns,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    environment: env.sentryEnv,
  });

  app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
};

export default Sentry;
