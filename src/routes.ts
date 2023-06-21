import bodyParser from 'body-parser';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import express from 'express';
import morgan from 'morgan';

import { FILE_PREFIX } from './common/constants';
import { logger, LogLevel } from './common/helpers/logger';
import FileController from './controllers/File';
import authRoutes from './routes/Auth';
import babyBookRoutes from './routes/BabyBook';
import checkUpRoutes from './routes/CheckUp';
import generalInformationRoutes from './routes/GeneralInformation';
import growthChartRoutes from './routes/GrowthChart';
import healthRoutes from './routes/Health';
import immunizationRoutes from './routes/Immunization';
import milestoneRoutes from './routes/Milestone';
import newsRoutes from './routes/News';
import noteRoutes from './routes/Note';
import notificationRoutes from './routes/Notification';
import feedbackRoutes from './routes/Feedback';
import userRoutes from './routes/User';
import subscriptionRoutes from './routes/Subscription';

dayjs.extend(utc);

const router = express.Router();

router.get('/health-check', (_req, res) => {
  res.send('BabyBook API OK !!');
});

router.use(
  express.json({
    verify: (req, res, buf) => {
      req['rawBody'] = buf;
    },
  })
);

if (process.env.NODE_ENV === 'development') {
  const stream = {
    write: (message: string) =>
      logger.log({
        message: message.trim(),
        level: LogLevel.Info,
      }),
  };
  router.use(morgan('dev', { stream }));
}

router.use(bodyParser.json({ limit: '1mb' }));
router.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/baby-books', babyBookRoutes);
router.use('/milestone', milestoneRoutes);
router.use('/health', healthRoutes);
router.use('/general-information', generalInformationRoutes);
router.use('/note', noteRoutes);
router.use('/immunization', immunizationRoutes);
router.use('/check-up', checkUpRoutes);
router.use('/growth-chart', growthChartRoutes);
router.use('/news', newsRoutes);
router.use('/notification', notificationRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/feedback', feedbackRoutes);

// File
router.use(`${FILE_PREFIX}/static/:filename`, FileController.getStaticFile);
router.use(`${FILE_PREFIX}/:userId/:filename`, FileController.getFile);

export default router;
