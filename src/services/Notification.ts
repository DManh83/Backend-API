import { get, has } from 'lodash';
import { Transaction } from 'sequelize/types';

import { NotificationCreation } from '../interfaces/Notification';
import NotificationModel from '../models/Notification';

class NotificationServices {
  public updateNotificationService = async (
    notification: NotificationModel,
    newData: Partial<NotificationCreation>,
    transaction: Transaction
  ) => {
    if (has(newData, 'isSeen')) {
      notification.isSeen = get(newData, 'isSeen');
    }

    return notification.save({ transaction });
  };

  public updateAllNotificationsService = async (userId: string, isSeen: boolean, transaction: Transaction) =>
    NotificationModel.update({ isSeen }, { where: { userId }, transaction });

  public removeNotificationService = async (notification: NotificationModel, transaction: Transaction) =>
    notification.destroy({ transaction });
}

export default NotificationServices;
