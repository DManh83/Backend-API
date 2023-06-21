import { Request, Response } from 'express';

import NotFoundError from '../common/errors/types/NotFoundError';
import { PaginationParams } from '../common/helpers/pagination/types';
import { paginationSerializer } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import { UpdateNotificationParams } from '../interfaces/Notification';
import NotificationRepository from '../repositories/Notification';
import { notificationSerializer } from '../serializers/notificationSerializer';
import NotificationServices from '../services/Notification';

class NotificationController extends NotificationServices {
  public getNotificationList = async (req: Request<{}, {}, {}, PaginationParams>, res: Response) => {
    const { user, query: params } = req;
    const notifications = await NotificationRepository.findNotificationsWithPagination(user, params);

    response.success(res, paginationSerializer(notifications, notificationSerializer));
  };

  public getUnreadCount = async (req: Request, res: Response) => {
    const { user } = req;
    const totalUnread = await NotificationRepository.countUnreadNotification(user.id);

    response.success(res, {
      totalUnread,
    });
  };

  public updateAllNotification = async (req: Request<{}, {}, UpdateNotificationParams>, res: Response) => {
    const { user, body: params } = req;

    await withTransaction(async (trans) => {
      await this.updateAllNotificationsService(user.id, params.isSeen, trans);
    });

    response.success(res);
  };

  public updateNotification = async (req: Request<{}, {}, UpdateNotificationParams>, res: Response) => {
    const { user, body: params } = req;
    const { id } = req.params as { id: string };

    const existedNotification = await NotificationRepository.findById(id);

    if (!existedNotification && user.id !== existedNotification.userId) {
      throw new NotFoundError(messages.notification.notFound);
    }

    await withTransaction(async (trans) => {
      await this.updateNotificationService(existedNotification, params, trans);
    });

    response.success(res);
  };

  public removeNotification = async (req: Request, res: Response) => {
    const { user } = req;
    const { id } = req.params as { id: string };

    const existedNotification = await NotificationRepository.findById(id);

    if (!existedNotification && user.id !== existedNotification.userId) {
      throw new NotFoundError(messages.notification.notFound);
    }

    await withTransaction(async (trans) => {
      await this.removeNotificationService(existedNotification, trans);
    });

    response.success(res);
  };
}

export default new NotificationController();
