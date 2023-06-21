import dayjs from 'dayjs';
import { Op } from 'sequelize';
import { CronJob } from '../../common/types';
import { cronJobs } from '../../common/constants';
import BabyBookModel from '../../models/BabyBook';
import imageStore from '../../common/helpers/imageStore';
import env from '../../../config/env';
import { logger } from '../../common/helpers/logger';

export const userDeletion: CronJob = {
  name: cronJobs.USER_DELETION,
  schedule: env.babyBookDeletionSchedule,
  handler: async () => {
    const dayDeleted = dayjs(new Date()).subtract(Number(env.babyBookRetentionPeriod), 'days').toISOString();

    try {
      const babyBooks = await BabyBookModel.findAll({
        where: {
          isDeleted: true,
          updatedAt: {
            [Op.lt]: dayDeleted,
          },
        },
      });

      if (babyBooks.length) {
        const BabyBookIds = babyBooks.map((babyBook) => babyBook.id);
        await BabyBookModel.destroy({ where: { id: { [Op.in]: BabyBookIds } } });
        const promises = babyBooks.map((babyBook) => imageStore.deleteFile(babyBook.userId, babyBook.photo));
        await Promise.all(promises);
      }
    } catch (error) {
      logger.error(error);
    }
  },
};
