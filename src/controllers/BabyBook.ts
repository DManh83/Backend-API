import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { flattenDeep, get, uniqBy } from 'lodash';
import { Op } from 'sequelize';

import BadRequestError from '../common/errors/types/BadRequestError';
import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import { PaginationParams } from '../common/helpers/pagination/types';
import { paginationSerializer } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import {
  BabyBookCreation,
  BabyBookSearchParams,
  BabyBookUpdateParams,
  CheckDuplicatedSharedBooks,
  CountBabyBookParams,
  CreateBabyBookParams,
  ShareBabyBookParams,
  VerifySharingSessionParams,
} from '../interfaces/BabyBook';
import { UserAttributes } from '../interfaces/User';
import BabyBookModel from '../models/BabyBook';
import DeviceModel from '../models/DevicesKey';
import UserModel from '../models/User';
import BabyBookRepository from '../repositories/BabyBook';
import { babyBookSerializer, sharingChangeSerializer, sharingSessionSerializer } from '../serializers/babybookSerializer';
import BabyBookServices from '../services/BabyBook';

export interface MulterRequest extends Request {
  file: any;
  files: any;
}

class BabyBookController extends BabyBookServices {
  public create = async (req: Request<{}, {}, CreateBabyBookParams>, res: Response) => {
    const { file } = req as MulterRequest;
    const photo = get(file, 'filename', null);
    const babyBookData: BabyBookCreation = { ...req.body, photo, userId: req.user.id, isDeleted: false };
    const babyBook = await BabyBookModel.create(babyBookData);

    response.success(res, babyBookSerializer(babyBook));
  };

  public list = async (req: Request<{}, {}, {}, BabyBookSearchParams>, res: Response) => {
    const params = parseFormData(req.query, ['isDeleted', 'isGetAll']);

    if (params.isGetAll) {
      const babyBooks = await BabyBookRepository.findByUserId(req.user.id, params);

      response.success(res, babyBooks.map(babyBookSerializer));
    } else {
      const babyBooks = await BabyBookRepository.findWithPagination({ userId: req.user.id, paginationParams: params });

      response.success(res, paginationSerializer(babyBooks, babyBookSerializer));
    }
  };

  public update = async (req: Request<{}, {}, BabyBookUpdateParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const { file, user } = req as MulterRequest;
    const photo = get(file, 'filename', null);
    const updateData: BabyBookUpdateParams = { ...req.body, photo };

    const babyBook = await BabyBookModel.findOne({ where: { id } });

    if (!babyBook) {
      throw new NotFoundError(messages.babyBook.notFound);
    }
    const babyBookUpdated = await this.updateBabyBooks(babyBook, updateData, user.requestBy);
    response.success(res, babyBookSerializer(babyBookUpdated));
  };

  public delete = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { force = 'false' } = req.query;
    const ids = id.split(',');

    const babyBooks = await BabyBookModel.findAll({ where: { id: { [Op.in]: ids }, userId: req.user.id } });

    if (babyBooks.length !== ids.length) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    await withTransaction(async (trans) => {
      await this.deleteBabyBooks(babyBooks, JSON.parse(force as string), trans);
    });

    response.success(res);
  };

  public undo = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const ids = id.split(',');

    const babyBooks = await BabyBookModel.findAll({ where: { id: { [Op.in]: ids }, userId: req.user.id } });

    if (babyBooks.length !== ids.length) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    await BabyBookModel.update({ isDeleted: false }, { where: { id: { [Op.in]: ids } } });

    babyBooks.forEach((babyBook) => {
      babyBook.isDeleted = false;
    });

    response.success(res, babyBooks.map(babyBookSerializer));
  };

  public countBabyBook = async (req: Request<{}, {}, {}, CountBabyBookParams>, res: Response) => {
    const total = await BabyBookRepository.getTotalBabyBook(req.query);
    response.success(res, total);
  };

  public shareBabyBook = async (req: Request<{}, {}, ShareBabyBookParams>, res: Response) => {
    const { body: params, user } = req;

    const babyBooks = await BabyBookRepository.findBabyBookByIds(params.babyBookIds, { userId: user.id });

    if (params.email.toLowerCase() === user.email) {
      throw new BadRequestError(messages.babyBook.shareYourself);
    }

    if (babyBooks.length !== params.babyBookIds.length) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    await withTransaction(async (trans) => {
      const duplicatedSessions = await BabyBookRepository.getDuplicatedSharedBooks(user.id, params);
      const [sharingSession] = await Promise.all([
        this.createSharingSession(user as UserAttributes, params, trans),
        ...duplicatedSessions.map(async (s) => {
          await this.stopSharingSessionService(s, trans);
        }),
      ]);

      await this.createSharingSessionBabyBookRelationship(sharingSession, params.babyBookIds, trans);
      await this.sendEmailSharingSuccessfully(params.email, sharingSession, user, babyBooks);
    });

    response.success(res);
  };

  public verifySharingSession = async (req: Request<{}, {}, VerifySharingSessionParams>, res: Response) => {
    const { email, sessionId } = req.body;

    const existedSession = await BabyBookRepository.findSharingSessionById(sessionId);

    if (!existedSession) {
      throw new NotFoundError(messages.babyBook.sharingSessionNotFound);
    }

    if (existedSession.email !== email) {
      throw new BadRequestError(messages.babyBook.sharingSessionInvalidEmail);
    }

    if (existedSession.expiredAfter && dayjs().diff(dayjs(existedSession.expiredAfter)) > 0) {
      throw new BadRequestError(messages.babyBook.sharingSessionExpired);
    }

    response.success(res, sharingSessionSerializer(existedSession));
  };

  public stopSharingSession = async (req: Request, res: Response) => {
    const { user } = req;
    const existedSession = await BabyBookRepository.findSharingSessionById(req.params.id, true);

    if (!existedSession) {
      throw new NotFoundError(messages.babyBook.sharingSessionNotFound);
    }

    const [babyBooks, userSent] = await Promise.all([
      await BabyBookRepository.findBabyBookByIds(
        existedSession.sessionBabyBook.map((sessionBabyBook) => sessionBabyBook.babyBookId),
        { userId: user.id }
      ),
      await UserModel.findOne({ where: { email: existedSession.email } }),
    ]);

    const userSentDevice = userSent ? await DeviceModel.findAll({ where: { userId: userSent.id } }) : [];

    await withTransaction(async (trans) => {
      await Promise.all([
        await this.stopSharingSessionService(existedSession, trans),
        await this.sendEmailAndNotificationStopSharing(
          existedSession.email,
          existedSession,
          user,
          babyBooks,
          userSentDevice.map((user) => user.token)
        ),
      ]);
    });

    response.success(res);
  };

  public deleteSharedSession = async (req: Request, res: Response) => {
    const existedSession = await BabyBookRepository.findSharingSessionById(req.params.id);

    if (!existedSession) {
      throw new NotFoundError(messages.babyBook.sharingSessionNotFound);
    }

    await existedSession.destroy();

    response.success(res);
  };

  public getListSharedSession = async (req: Request<{}, {}, {}, PaginationParams>, res: Response) => {
    const { user } = req;

    const sessions = await BabyBookRepository.paginateSharingSession(user.id, req.query);

    response.success(res, paginationSerializer(sessions, sharingSessionSerializer));
  };

  getSharedBabyBook = async (req: Request, res: Response) => {
    const { session } = req;

    const babyBooks = await BabyBookRepository.findBabyBookByIds(
      session.sessionBabyBook.map((s) => s.babyBookId),
      { userId: session.userId }
    );

    response.success(res, babyBooks.map(babyBookSerializer));
  };

  getSharedBookOfUser = async (req: Request<{}, {}, {}, { searchValue?: string }>, res: Response) => {
    const { user, query: params } = req;

    const bookIds = await BabyBookRepository.findSharedBabyBooksOfUser(user.email);

    const babyBooks = await BabyBookRepository.findBabyBookByIds(bookIds, { name: params.searchValue });

    response.success(res, babyBooks.map(babyBookSerializer));
  };

  checkSessionStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const existedSession = await BabyBookRepository.findSharingSessionById(id);

    if (!existedSession) {
      throw new NotFoundError(messages.babyBook.sharingSessionNotFound);
    }

    if (!existedSession.availableAfter && !existedSession.expiredAfter) {
      await withTransaction(async (trans) => {
        await this.activateSharingSessionService(existedSession, trans);
      });
    } else if (existedSession.expiredAfter && dayjs().diff(dayjs(existedSession.expiredAfter)) > 0) {
      throw new BadRequestError(messages.babyBook.sharingSessionExpired);
    }

    response.success(res, {
      role: existedSession.role,
      email: existedSession.email,
    });
  };

  getSharingChanges = async (req: Request<{}, {}, {}, PaginationParams>, res: Response) => {
    const { user, query } = req;

    const sharingChanges = await BabyBookRepository.getSharingChangesWithPagination(user.id, query);

    response.success(res, paginationSerializer(sharingChanges, sharingChangeSerializer));
  };

  checkDuplicatedSharedBooks = async (req: Request<{}, {}, CheckDuplicatedSharedBooks>, res: Response) => {
    const { user, body: params } = req;

    const sessions = await BabyBookRepository.getDuplicatedSharedBooks(user.id, params);

    const books = uniqBy(flattenDeep(sessions.map(sharingSessionSerializer).map((s) => s.babyBooks)), 'id');

    response.success(res, books);
  };
}

export default new BabyBookController();
