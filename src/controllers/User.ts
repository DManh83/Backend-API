import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { has } from 'lodash';
import Stripe from 'stripe';

import env from '../../config/env';
import { FeatureType, UserRole } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ForbiddenError from '../common/errors/types/ForbiddenError';
import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import { getTemplate, sendNewsletterMailjet } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import { generateToken } from '../common/lib/passports';
import phone from '../common/lib/Twillio';
import messages from '../common/messages';
import { AddDevicesTokenParams } from '../interfaces/DevicesKey';
import { FeedbackCreation } from '../interfaces/Feedback';
import { CountUserParams, GetUserListParams, UpdateStaffParams, UserUpdateParams } from '../interfaces/User';
import FeedbackModel from '../models/Feedback';
import SubscriptionModel from '../models/Subscription';
import UserModel from '../models/User';
import AuthRepository from '../repositories/Auth';
import BabyBookRepository from '../repositories/BabyBook';
import CheckUpRepository from '../repositories/CheckUp';
import GrowChartRepository from '../repositories/GrowthChart';
import HealthRepository from '../repositories/Health';
import ImmunizationRepository from '../repositories/Immunization';
import MilestoneRepository from '../repositories/Milestone';
import NoteRepository from '../repositories/Note';
import SubscriptionRepository from '../repositories/Subscription';
import UserRepository from '../repositories/User';
import { userSerializer } from '../serializers/userSerializer';
import UserServices from '../services/User';
import SharingSessionModel from '../models/SharingSession';

const stripe = new Stripe(env.stripeSecretKey, { apiVersion: '2020-08-27' });

class UserController extends UserServices {
  public getMe = async (req: Request, res: Response) => {
    const user = await UserRepository.getById(req.user.id);
    response.success(res, userSerializer(user));
  };

  public updateInfo = async (req: Request<{}, {}, UserUpdateParams>, res: Response) => {
    const user = await UserRepository.getById(req.user.id);
    if (req.body.fileName) {
      req.body.avatar = req.body.fileName;
    }
    await withTransaction(async (trans) => {
      await this.updateUserInfo(user, req.body, trans);
    });
    response.success(res, userSerializer(user));
  };

  public updateSessionExpire = async (req: Request<{}, {}, { sessionExpire: number }>, res: Response) => {
    const user = await UserRepository.getById(req.user.id);
    await withTransaction(async (trans) => {
      await this.changeSessionExpire(user, req.body.sessionExpire, trans);
    });
    const newToken = generateToken(user);
    response.success(res, { token: newToken, user: userSerializer(user) });
  };

  public autoSuggestion = async (req: Request, res: Response) => {
    const { searchKey: key } = req.query;
    const users = await UserRepository.getSuggestion({ key });
    response.success(res, users);
  };

  public getUserList = async (req: Request<{}, {}, {}, GetUserListParams>, res: Response) => {
    const { subscribers, ...params }: GetUserListParams = parseFormData(req.query, ['roles', 'countryCodes']);

    const [users, total] = await UserRepository.getUserWithPagination(params);

    const data: any = {
      list: users.map(userSerializer),
      total,
    };
    if (has(req.query, 'subscribers')) {
      const totalSubscribers = await UserRepository.getTotalSubscribers(subscribers);
      data.totalSubscribers = totalSubscribers;
    }
    response.success(res, data);
  };

  public updateStaff = async (req: Request<{}, {}, UpdateStaffParams>, res: Response) => {
    const { body: params, user } = req;

    const isAdmin = user.role === UserRole.ADMIN;

    const existedUser = await UserRepository.getByEmail(params.email);

    if (!existedUser) {
      throw new NotFoundError(messages.user.notFound);
    }

    if (!isAdmin || existedUser.email === user.email) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    await withTransaction(async (trans) => {
      await this.updateUserService(existedUser, { role: params.role }, trans);
    });

    response.success(res);
  };

  public countUser = async (req: Request<{}, {}, {}, CountUserParams>, res: Response) => {
    const total = await UserRepository.getTotalUser(req.query);
    response.success(res, total);
  };

  public requestChangePhone = async (req: Request<{}, {}, { newPhone: string }>, res: Response) => {
    const { newPhone } = req.body;

    const existedUser = await UserRepository.getByPhone(newPhone.trim());

    if (existedUser) {
      throw new BadRequestError(messages.user.phoneAlreadyInUse);
    }
    try {
      await phone.requestPhoneVerification(newPhone);
    } catch (error) {
      if (error.code === 60203) {
        throw new BadRequestError(messages.auth.maxAttemptsReach);
      }
    }
    response.success(res, {
      expiredTime: dayjs().add(5, 'minute').toDate(),
    });
  };

  public updatePhone = async (req: Request<{}, {}, { newPhone: string; otp: string; expiredTime: Date }>, res: Response) => {
    const { newPhone, otp, expiredTime } = req.body;
    const user = await UserRepository.getById(req.user.id);
    let verified = false;
    try {
      verified = await phone.verifyPhoneToken(newPhone, otp);
    } catch (error) {
      if (error.code === 60202) {
        throw new BadRequestError(messages.auth.maxAttemptsReach);
      }
    }
    if (dayjs().diff(expiredTime, 'second') > 0) {
      throw new BadRequestError(messages.auth.expiredVerificationCode);
    }
    if (verified) {
      await withTransaction(async (trans) => {
        await this.changePhone(user, newPhone, trans);
      });
    } else {
      throw new BadRequestError(messages.auth.invalidVerificationCode);
    }

    response.success(res);
  };

  public addDevicesToken = async (req: Request<{}, {}, AddDevicesTokenParams>, res: Response) => {
    const { user } = req;
    const { token } = req.body;

    const existedToken = await UserRepository.haveDeviceToken(token);

    if (existedToken) {
      response.success(res);
    } else {
      await withTransaction(async (trans) => {
        await this.addDeviceTokenService(user.id, token, trans);
      });
      response.success(res);
    }
  };

  public deleteDeviceToken = async (req: Request, res: Response) => {
    const { user } = req;
    const { token } = req.params;

    const existedToken = await UserRepository.haveDeviceToken(token);

    if (!existedToken || existedToken.userId !== user.id) {
      throw new BadRequestError(messages.user.deviceTokenNotFound);
    }
    await withTransaction(async (trans) => {
      await this.deleteDeviceTokenService(token, trans);
    });
    response.success(res);
  };

  public searchGlobal = async (req: Request, res: Response) => {
    const { user, session } = req;
    const { value } = req.query as { value: string };

    if (session && !session.sessionBabyBook.length) {
      throw new NotFoundError(messages.babyBook.notFound);
    }
    const data: any = [];

    let babyBooks;
    if (user) {
      babyBooks = await BabyBookRepository.findByUserId(user?.id, { isDeleted: false });
      const bookIds = await BabyBookRepository.findSharedBabyBooksOfUser(user.email);
      const sharedBabyBooks = await BabyBookRepository.findBabyBookByIds(bookIds);
      babyBooks.push(...sharedBabyBooks);
    } else {
      babyBooks = await BabyBookRepository.findBabyBookByIds([...session.sessionBabyBook.map((session) => session.babyBookId)], {
        userId: session?.userId,
      });
    }
    const babyBookIds = babyBooks.map((babyBook) => babyBook.id);

    // Growth Chart Search
    const getNumber = value.match(/^\d*\.?\d+/);

    if (getNumber && Number.parseFloat(getNumber[0])) {
      let number = Number.parseFloat(getNumber[0]);
      let unit = value.split(getNumber[0])[1].toLowerCase().trim();

      switch (unit) {
        case 'inch':
          unit = 'cm';
          number *= 1 / 0.393700787;
          break;
        case 'lbs':
          unit = 'kg';
          number *= 1 / 2.2046;
          break;
        default:
          break;
      }

      if (['cm', 'kg', ''].includes(unit)) {
        const growthPoints = await GrowChartRepository.findPointByValue([...babyBookIds], number, unit);
        data.push(
          ...growthPoints.map((point) => ({
            babyBookId: point.babyBookId,
            babyBookName: babyBooks.find((babyBook) => babyBook.id === point.babyBookId).name,
            feature: FeatureType.GROWTH_CHART,
            date: point.updatedAt,
            result: {
              point: point.date,
            },
          }))
        );
      }
    }

    // General Info Search
    data.push(
      ...babyBooks.map((babyBook) => ({
        feature: FeatureType.GENERAL_INFORMATION,
        babyBookId: babyBook.id,
        babyBookName: babyBook.name,
        date: babyBook.updatedAt,
      }))
    );

    // Milestones Search
    const milestones = await MilestoneRepository.findAlbumSearchValue([...babyBookIds], value);
    data.push(
      ...milestones.map((milestone) => ({
        feature: FeatureType.MILESTONES,
        babyBookId: milestone.babyBookId,
        babyBookName: babyBooks.find((babyBook) => babyBook.id === milestone.babyBookId).name,
        date: milestone.updatedAt,
        result: {
          albumName: milestone.name,
          isStandard: milestone.isStandard,
          albumId: milestone.id,
        },
      }))
    );

    // Notes Search
    const notes = await NoteRepository.findNoteBySearchValue([...babyBookIds], value);
    data.push(
      ...notes.map((note) => ({
        feature: FeatureType.NOTE,
        babyBookId: note.babyBookId,
        babyBookName: babyBooks.find((babyBook) => babyBook.id === note.babyBookId).name,
        date: note.updatedAt,
        result: {
          noteTitle: note.title,
        },
      }))
    );

    // Check Up Search
    const schedules = await CheckUpRepository.findCheckUpByTitle([...babyBookIds], value);
    data.push(
      ...schedules
        .filter((schedule) => schedule.checkUp)
        .map((schedule) => ({
          feature: FeatureType.CHECKS_UP,
          babyBookId: schedule.babyBookId,
          babyBookName: babyBooks.find((babyBook) => babyBook.id === schedule.babyBookId).name,
          date: schedule.updatedAt,
          result: {
            checkUpTitle: schedule.checkUp.title,
            isSuggested: schedule.isSuggested,
          },
        }))
    );

    const files = await CheckUpRepository.findDocumentsByFile([...babyBookIds], value);

    data.push(
      ...files
        .filter((file) => file.fileSchedule && file.fileSchedule.checkUp)
        .map((file) => ({
          feature: FeatureType.CHECKS_UP,
          babyBookId: file.babyBookId,
          babyBookName: babyBooks.find((babyBook) => babyBook.id === file.babyBookId).name,
          date: file.updatedAt,
          result: {
            filename: file.filename,
            ageDueOrDateDue: file.fileSchedule.checkUp.ageDue || file.fileSchedule.dateDue,
            dateDue: file.fileSchedule.dateDue,
            checkUpTitle: file.fileSchedule.checkUp.title,
            isSuggested: file.fileSchedule.isSuggested,
          },
        }))
    );

    // Immunization Search
    const immunizations = await ImmunizationRepository.findImmunizationByValue([...babyBookIds], value);

    immunizations
      .filter((immunization) => immunization.immunizations.immunizationAntigen.length)
      .forEach((immunization) => {
        data.push(
          ...immunization.immunizations.immunizationAntigen
            .filter((item) => item.antigen)
            .map((item) => ({
              feature: FeatureType.IMMUNIZATION,
              babyBookId: immunization.babyBookId,
              babyBookName: babyBooks.find((babyBook) => babyBook.id === immunization.babyBookId).name,
              date: immunization.updatedAt,
              result: {
                antigenName: item.antigen.name,
                isSuggested: immunization.isSuggested,
              },
            }))
        );
      });

    // Health Search
    const healthFolders = await HealthRepository.findFoldersByValue([...babyBookIds], value);
    data.push(
      ...healthFolders.map((folder) => ({
        feature: FeatureType.HEALTH,
        babyBookId: folder.babyBookId,
        babyBookName: babyBooks.find((babyBook) => babyBook.id === folder.babyBookId).name,
        date: folder.updatedAt,
        result: {
          folderId: folder.id,
          folderName: folder.name,
        },
      }))
    );

    const documents = await HealthRepository.findDocumentsByValue([...babyBookIds], value);
    data.push(
      ...documents.map((document) => ({
        feature: FeatureType.HEALTH,
        babyBookId: document.babyBookId,
        babyBookName: babyBooks.find((babyBook) => babyBook.id === document.babyBookId).name,
        date: document.updatedAt,
        result: {
          folderId: document.healthFolderId,
          folderName: document.documentFolder.name,
          fileName: document.filename,
        },
      }))
    );

    const documentsByContent = await HealthRepository.findDocumentsByValue([...babyBookIds], value, true);
    data.push(
      ...documentsByContent.map((document) => ({
        feature: FeatureType.HEALTH,
        babyBookId: document.babyBookId,
        babyBookName: babyBooks.find((babyBook) => babyBook.id === document.babyBookId).name,
        date: document.updatedAt,
        result: {
          folderId: document.healthFolderId,
          folderName: document.documentFolder.name,
          fileName: document.filename,
          translatedText: value,
        },
      }))
    );

    response.success(res, { data });
  };

  public checkRegisteredEmail = async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const { body: params } = req;

    const existedUser = await UserRepository.getByEmail(params.email);

    if (existedUser) {
      response.success(res, true);
    } else {
      response.success(res, false);
    }
  };

  public getEmail = async (req: Request, res: Response) => {
    const { id } = req.query as { id: string };

    const existedUser = await UserRepository.getById(id);

    if (!existedUser) throw new NotFoundError(messages.user.notFound);

    response.success(res, { email: existedUser.email });
  };

  public unsubscribe = async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const { email } = req.body;

    const existedUser = await UserRepository.getByEmail(email);

    if (!existedUser) throw new NotFoundError(messages.user.notFound);

    await withTransaction(async (transaction) => {
      await this.updateUserInfo(existedUser, { subscribeNewsletter: false }, transaction);
    });

    response.success(res);
  };

  public deleteUser = async (req: Request<{}, {}, { password: string; reason: string; feedback?: string }>, res: Response) => {
    const { user, body: params } = req;
    const isAuth = await AuthRepository.checkAuthentication(user.email, params.password);
    if (isAuth) {
      const feedBack: FeedbackCreation = {
        reason: params.reason,
        email: user.email,
        feedback: params.feedback || '',
      };

      const existedSubscription = await SubscriptionRepository.getSubscriptionByUserId(user.id);

      await withTransaction(async (transaction) => {
        const tasks: Promise<any>[] = [
          FeedbackModel.create(feedBack, { transaction }),
          UserModel.destroy({
            where: {
              id: user.id,
            },
            transaction,
          }),
        ];
        await SharingSessionModel.update({ expiredAfter: new Date() }, { where: { email: user.email }, transaction });

        if (existedSubscription && existedSubscription.subscriptionId.includes('sub_')) {
          tasks.push(
            stripe.subscriptions.del(user.subscription.subscriptionId),
            SubscriptionModel.destroy({
              where: {
                subscriptionId: user.subscription.subscriptionId,
              },
              transaction,
            })
          );
        }

        await Promise.all(tasks);
      });
    } else {
      throw new BadRequestError(messages.auth.failed);
    }
    response.success(res);
  };

  public getTemplateEmail = async (req: Request<{}, {}, {}, { templateId?: string }>, res: Response) => {
    const { templateId } = req.query;
    const data = await getTemplate(templateId || null);

    response.success(res, { data });
  };

  public sendNewsletter = async (req: Request<{}, {}, { templateId: string; emails: string[]; isSendAll: boolean }, {}>, res: Response) => {
    const { templateId, emails, isSendAll } = req.body;
    let subscriberEmails = [];
    if (isSendAll) {
      const subscribers = await UserRepository.getSubscribers();
      subscriberEmails = subscribers.map((subscriber) => ({ email: subscriber.email, id: subscriber.id }));
    } else {
      subscriberEmails = emails.map((email) => ({ email, id: null }));
    }
    const isSuccess = sendNewsletterMailjet(templateId, subscriberEmails);

    if (!isSuccess) {
      throw new BadRequestError();
    }
    response.success(res);
  };
}

export default new UserController();
