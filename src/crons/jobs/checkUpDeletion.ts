import dayjs from 'dayjs';
import { Op } from 'sequelize';

import env from '../../../config/env';
import { cronJobs } from '../../common/constants';
import imageStore from '../../common/helpers/imageStore';
import { logger } from '../../common/helpers/logger';
import { CronJob } from '../../common/types';
import CheckUpFile from '../../models/CheckUpFile';

export const checkUpDeletion: CronJob = {
  name: cronJobs.CHECK_UP_DELETION,
  schedule: env.checkUpDeletionSchedule,
  handler: async () => {
    const dayDeleted = dayjs(new Date()).subtract(Number(env.checkUpRetentionPeriod), 'days').toISOString();

    try {
      const files = await CheckUpFile.findAll({
        where: {
          isDeleted: true,
          deletedAt: {
            [Op.lt]: dayDeleted,
          },
        },
      });

      if (files.length) {
        const fileIds = files.map((file) => file.id);
        await CheckUpFile.destroy({ where: { id: { [Op.in]: fileIds } } });

        const promises = files.map((file) => imageStore.deleteFile(file.userId, file.pathname));
        await Promise.all(promises);
      }
    } catch (error) {
      logger.error(error);
    }
  },
};
