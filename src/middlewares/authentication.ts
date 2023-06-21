import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Op } from 'sequelize';

import { UserRole } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ForbiddenError from '../common/errors/types/ForbiddenError';
import NotFoundError from '../common/errors/types/NotFoundError';
import UnauthorizedError from '../common/errors/types/UnauthorizedError';
import messages from '../common/messages';
import SharingSessionModel from '../models/SharingSession';
import BabyBookRepository from '../repositories/BabyBook';
import UserRepository from '../repositories/User';

export default (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', {}, async (error, data, info) => {
    if (error) {
      return next(error);
    }

    const ownerId = req.headers['ownerid'] as string | undefined;

    if (ownerId && data?.user && ownerId !== data.user.id) {
      const [owner, validSharing] = await Promise.all([
        UserRepository.getUserWithSubscriptionById(ownerId),
        SharingSessionModel.findOne({
          where: {
            userId: ownerId,
            email: data.user.email,
            availableAfter: { [Op.ne]: null },
            expiredAfter: {
              [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null }],
            },
          },
        }),
      ]);

      if (owner && validSharing) {
        req.user = owner as Express.User;
        req.user.requestBy = data.user.email;
        res.locals = res.locals || {};
        res.locals.user = owner as Express.User;
        return next();
      }
    } else if (data && data.user) {
      req.user = data.user.dataValues;
      res.locals = res.locals || {};
      res.locals.user = data.user;

      return next();
    }

    return next(new UnauthorizedError(messages.auth.invalidToken));
  })(req, res, next);
};

export const staffAuthentication = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', {}, (error, data, info) => {
    if (error) {
      return next(error);
    }

    if (data && data.user && [UserRole.ADMIN, UserRole.EDITOR].includes(data.user.role)) {
      req.user = data.user.dataValues;
      res.locals = res.locals || {};
      res.locals.user = data.user;

      return next();
    }

    return next(new ForbiddenError(messages.auth.permissionDenied));
  })(req, res, next);
};

export const adminAuthentication = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', {}, (error, data, info) => {
    if (error) {
      return next(error);
    }

    if (data && data.user && UserRole.ADMIN === data.user.role) {
      req.user = data.user.dataValues;
      res.locals = res.locals || {};
      res.locals.user = data.user;

      return next();
    }

    return next(new ForbiddenError(messages.auth.permissionDenied));
  })(req, res, next);
};

export const verifySession = (req: Request, res: Response, next: NextFunction) =>
  (async () => {
    const { sessionId, email } = req.query as { sessionId: string; email: string };

    if (!sessionId || !email) {
      return next(new NotFoundError(messages.babyBook.sharingSessionNotFound));
    }

    const existedSession = await BabyBookRepository.findSharingSessionById(sessionId, true);

    if (!existedSession || existedSession.email !== email) {
      return next(new NotFoundError(messages.babyBook.sharingSessionNotFound));
    }

    if (existedSession.expiredAfter && dayjs().diff(dayjs(existedSession.expiredAfter)) > 0) {
      return next(new BadRequestError(messages.babyBook.sharingSessionExpired));
    }

    req.session = existedSession;
    return next();
  })();
