import dayjs from 'dayjs';
import { Op } from 'sequelize';

import env from '../../../config/env';
import { cronJobs } from '../../common/constants';
import imageStore from '../../common/helpers/imageStore';
import { logger } from '../../common/helpers/logger';
import { CronJob } from '../../common/types';
import HealthDocumentModel from '../../models/HealthDocument';
import HealthFolderModel from '../../models/HealthFolder';

export const healthDeletion: CronJob = {
  name: cronJobs.HEALTH_DELETION,
  schedule: env.healthDeletionSchedule,
  handler: async () => {
    const dayDeleted = dayjs(new Date()).subtract(Number(env.healthRetentionPeriod), 'days').toISOString();

    try {
      const healthFolders = await HealthFolderModel.findAll({
        where: {
          isDeleted: true,
          deletedAt: {
            [Op.lt]: dayDeleted,
          },
        },
      });
      if (healthFolders.length) {
        const folderIds = healthFolders.map((folder) => folder.id);

        await HealthFolderModel.destroy({ where: { id: { [Op.in]: folderIds } } });
      }
    } catch (error) {
      logger.error(error);
    }

    try {
      const documents = await HealthDocumentModel.findAll({
        where: {
          isDeleted: true,
          deletedAt: {
            [Op.lt]: dayDeleted,
          },
        },
      });

      if (documents.length) {
        const documentIds = documents.map((doc) => doc.id);
        await HealthDocumentModel.destroy({ where: { id: { [Op.in]: documentIds } } });

        const promises = documents.map((doc) => imageStore.deleteFile(doc.userId, doc.pathname));
        await Promise.all(promises);
      }
    } catch (error) {
      logger.error(error);
    }
  },
};
