import cron from 'node-cron';
import { logger } from '../common/helpers/logger';
import { CronJob } from '../common/types';
import { checkUpDeletion } from './jobs/checkUpDeletion';
import { healthDeletion } from './jobs/healthDeletion';
import { milestoneDeletion } from './jobs/milestoneDeletion';
import { noteDeletion } from './jobs/noteDeletion';
import { notificationCreation } from './jobs/notificationCreation';
import { userDeletion } from './jobs/userDeletion';

const cronJobsList: CronJob[] = [];

cronJobsList.push(userDeletion, milestoneDeletion, healthDeletion, noteDeletion, checkUpDeletion, notificationCreation);

const main = () => {
  for (const job of cronJobsList) {
    logger.info(`Adding a cron job: ${job.name}`);

    cron
      .schedule(job.schedule, async () => {
        try {
          await job.handler();
        } catch (error) {
          logger.info(`Cron jobs error: ${job.name}`);
        }
      })
      .start();
  }
};

main();
