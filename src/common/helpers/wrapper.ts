import { NextFunction, Request, Response } from 'express';
import { logger } from './logger';

/**
 * Catch any unhandled errors or exceptions
 */
export default (callback: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
    try {
      return await callback(req, res, next);
    } catch (error) {
      logger.error(`${req.method} ${req.url}`);
      logger.error(error.stack);

      if (error instanceof Error) {
        next(error);
      } else if (error) {
        next(new Error(`Unhandled promise rejection: ${JSON.stringify(error)}`));
      } else {
        next(new Error('Unknown Error Occurred'));
      }
    }
  };
