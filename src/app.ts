import express, { Application, Router } from 'express';
import passport from 'passport';
import { handleCommonHttpError, handleRequestValidationError, handleServerException, handleRouteNotFound } from './common/errors';
import { logger } from './common/helpers/logger';
import { passportConfiguration } from './common/lib/passports';
import Sentry, { initSentry } from './common/lib/sentry';

interface ExpressApplication {
  port?: number;
  middleWares?: any;
  apiPrefix?: string;
  routes: Router;
}

export default class App {
  private app: Application = express();
  private port: number;

  constructor(appInit: ExpressApplication) {
    this.port = appInit.port;
    this.init(appInit);
  }

  private init(appInit: ExpressApplication) {
    this.sentryInit();
    this.middlewares(appInit.middleWares || []);
    this.initPassport();
    this.initRoutes(appInit.apiPrefix, appInit.routes);
    this.sentryTracking();
    this.handleError();
  }

  private sentryInit() {
    initSentry(this.app);
  }

  private sentryTracking() {
    this.app.use(
      Sentry.Handlers.errorHandler({
        shouldHandleError: (error) => error instanceof Error,
      }) as express.ErrorRequestHandler
    );
  }

  private middlewares(middleWares: []) {
    for (const middleware of middleWares) {
      this.app.use(middleware);
    }
  }

  private initPassport() {
    passportConfiguration(passport);
    this.app.use(passport.initialize());
  }

  private initRoutes(apiPrefix: string, route: Router) {
    this.app.use(apiPrefix, route);
  }

  private handleError() {
    this.app.use(handleRouteNotFound);
    this.app.use(handleRequestValidationError);
    this.app.use(handleCommonHttpError);
    this.app.use(handleServerException);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`App is listening on port ${this.port}`);
    });
  }
}
