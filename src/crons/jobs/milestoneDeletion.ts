import dayjs from 'dayjs';
import { Op } from 'sequelize';

import env from '../../../config/env';
import { cronJobs } from '../../common/constants';
import imageStore from '../../common/helpers/imageStore';
import { logger } from '../../common/helpers/logger';
import { CronJob } from '../../common/types';
import MilestoneModel from '../../models/Milestone';
import MilestoneAlbumModel from '../../models/MilestoneAlbum';
import MilestonePhotoModel from '../../models/MilestonePhoto';

export const milestoneDeletion: CronJob = {
  name: cronJobs.MILESTONE_DELETION,
  schedule: env.milestoneDeletionSchedule,
  handler: async () => {
    const dayDeleted = dayjs(new Date()).subtract(Number(env.milestoneRetentionPeriod), 'days').toISOString();

    try {
      const milestoneAlbums = await MilestoneAlbumModel.findAll({
        where: {
          isDeleted: true,
          updatedAt: {
            [Op.lt]: dayDeleted,
          },
        },
      });
      if (milestoneAlbums.length) {
        const albumIds = milestoneAlbums.map((album) => album.id);
        await MilestoneAlbumModel.destroy({ where: { id: { [Op.in]: albumIds } } });
      }
    } catch (error) {
      logger.error(error);
    }

    try {
      const milestones = await MilestoneModel.findAll({
        where: {
          isDeleted: true,
          updatedAt: {
            [Op.lt]: dayDeleted,
          },
        },
      });
      if (milestones.length) {
        const milestoneIds = milestones.map((milestone) => milestone.id);
        await MilestoneModel.destroy({ where: { id: { [Op.in]: milestoneIds } } });
      }
    } catch (error) {
      logger.error(error);
    }

    try {
      const photos = await MilestonePhotoModel.findAll({
        where: {
          isDeleted: true,
          updatedAt: {
            [Op.lt]: dayDeleted,
          },
        },
      });
      if (photos.length) {
        const photoIds = photos.map((photo) => photo.id);
        await MilestonePhotoModel.destroy({ where: { id: { [Op.in]: photoIds } } });

        const promises = photos.map((photo) => imageStore.deleteFile(photo.userId, photo.photo));
        await Promise.all(promises);
      }
    } catch (error) {
      logger.error(error);
    }
  },
};
