import dayjs from 'dayjs';
import { Op } from 'sequelize';

import env from '../../../config/env';
import { cronJobs } from '../../common/constants';
import { logger } from '../../common/helpers/logger';
import { CronJob } from '../../common/types';
import NoteModel from '../../models/Note';

export const noteDeletion: CronJob = {
  name: cronJobs.NOTE_DELETION,
  schedule: env.noteDeletionSchedule,
  handler: async () => {
    const dayDeleted = dayjs(new Date()).subtract(Number(env.noteRetentionPeriod), 'days').toISOString();

    try {
      const notes = await NoteModel.findAll({
        where: {
          isDeleted: true,
          deletedAt: {
            [Op.lt]: dayDeleted,
          },
        },
      });
      if (notes.length) {
        const noteIds = notes.map((note) => note.id);

        await NoteModel.destroy({ where: { id: { [Op.in]: noteIds } } });
      }
    } catch (error) {
      logger.error(error);
    }
  },
};
