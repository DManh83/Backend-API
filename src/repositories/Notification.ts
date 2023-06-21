import { PaginationParams } from '../common/helpers/pagination/types';

import { getPaginateOptions } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import BabyBookModel from '../models/BabyBook';
import NotificationModel from '../models/Notification';

class NotificationRepository {
  findById = async (id: string) => NotificationModel.findOne({ where: { id } });

  findNotificationsWithPagination = async (user: { id: string }, paginationParams: PaginationParams) => {
    const paginateOptions = getPaginateOptions(paginationParams);

    return withPaginate<NotificationModel>(NotificationModel)({
      ...paginateOptions,
      where: {
        userId: user.id,
      },
      include: [
        {
          model: BabyBookModel,
          as: 'babyBook',
          required: false,
        },
      ],
    });
  };

  countUnreadNotification = async (userId: string) =>
    NotificationModel.count({
      where: {
        userId,
        isSeen: false,
      },
    });
}

export default new NotificationRepository();
