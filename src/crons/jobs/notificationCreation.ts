import dayjs from 'dayjs';
import { get, has, uniq } from 'lodash';
import { Op, WhereOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import env from '../../../config/env';
import constants, { API_PREFIX, cronJobs, FILE_PREFIX } from '../../common/constants';
import { NotificationEvent, EmailReminderType } from '../../common/enum';
import { logger } from '../../common/helpers/logger';
import mail from '../../common/lib/Mail';
import messages from '../../common/messages';
import { CronJob } from '../../common/types';
import BabyBookModel from '../../models/BabyBook';
import CheckUpScheduleModel from '../../models/CheckUpSchedule';
import DeviceModel from '../../models/DevicesKey';
import ImmunizationScheduleModel from '../../models/ImmunizationSchedule';
import NotificationModel from '../../models/Notification';
import UserModel from '../../models/User';
import FirebaseMessage from '../../common/lib/FirebaseMessage';
import SharingSessionModel from '../../models/SharingSession';
import SharingSessionBabyBookModel from '../../models/SharingSessionBabyBook';
import { UserAttributes, UserCreation } from '../../interfaces/User';

const getSessionEmails = async (babyBookId: string) => {
  const sessions = await SharingSessionModel.findAll({
    where: {
      availableAfter: { [Op.ne]: null },
      expiredAfter: {
        [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null }],
      },
      role: 'editor',
    },
    include: [
      {
        model: SharingSessionBabyBookModel,
        required: true,
        as: 'sessionBabyBook',
        where: {
          babyBookId,
        },
      },
    ],
  });

  return uniq(sessions.map((s) => s.email));
};

const sendEmailNotification = async (
  condition: WhereOptions<UserAttributes | UserCreation>,
  data: ImmunizationScheduleModel | CheckUpScheduleModel
) => {
  const emailCondition: WhereOptions<UserAttributes | UserCreation> = {
    ...condition,
    receiveMail: true,
  };
  const isCheckUp = has(data, 'userCheckUps');

  const emailReceivers = await UserModel.findAll({
    where: emailCondition,
  });

  emailReceivers.map((e) =>
    mail.requestSendMail({
      to: e.email,
      subject: messages.mail.subject.notificationReminder,
      template: constants.mailTemplate.notificationReminder,
      data: {
        babyBookName: get(data, isCheckUp ? 'babyBookCheckUps.name' : 'babyBookImmunization.name'),
        inDue: dayjs(data.dateDue).format('MMM DD, YYYY'),
        type: isCheckUp ? EmailReminderType.CHECKS_UP : EmailReminderType.IMMUNIZATION,
        imageUrl: `${env.apiUrl}${API_PREFIX}${FILE_PREFIX}/static/immunization.png`,
      },
    })
  );
};

const sendPushNotification = async (
  condition: WhereOptions<UserAttributes | UserCreation>,
  data: ImmunizationScheduleModel | CheckUpScheduleModel
) => {
  const pushCondition: WhereOptions<UserAttributes | UserCreation> = {
    ...condition,
    pushNotify: true,
  };
  const isCheckUp = has(data, 'userCheckUps');

  const pushReceivers = await UserModel.findAll({
    where: pushCondition,
  });

  const userDevices = await DeviceModel.findAll({
    where: {
      userId: {
        [Op.in]: pushReceivers.map((p) => p.id),
      },
    },
  });
  if (userDevices.length) {
    FirebaseMessage.sendMessageMulticast(
      userDevices.map((device) => device.token),
      isCheckUp ? 'Scheduled check-ups' : 'Immunizations',
      `${get(data, isCheckUp ? 'babyBookCheckUps.name' : 'babyBookImmunization.name')}'s ${
        isCheckUp ? 'scheduled check-up' : 'immunization'
      } is due in ${dayjs(data.dateDue).format('MMM DD, YYYY')}`,
      {
        event: isCheckUp ? NotificationEvent.CHECKS_UP_IS_DUE : NotificationEvent.IMMUNIZATION_IS_DUE,
        babyBook: get(data, isCheckUp ? 'babyBookCheckUps' : 'babyBookImmunization'),
      }
    );
  }
};

const sendNotification = async (
  condition: WhereOptions<UserAttributes | UserCreation>,
  data: ImmunizationScheduleModel | CheckUpScheduleModel
) => {
  const notifyReceivers = await UserModel.findAll({
    where: condition,
  });

  const isCheckUp = has(data, 'userCheckUps');

  const notificationShapes = notifyReceivers
    .map((e) => e.id)
    .map((userId) => ({
      id: uuidv4(),
      userId,
      babyBookId: data.babyBookId,
      event: isCheckUp ? NotificationEvent.CHECKS_UP_IS_DUE : NotificationEvent.IMMUNIZATION_IS_DUE,
      entityId: data.id,
      isSeen: false,
      isDeleted: false,
      metadata: {
        dateDue: data.dateDue,
      },
    }));

  await NotificationModel.bulkCreate(notificationShapes);
};

export const notificationCreation: CronJob = {
  name: cronJobs.NOTIFICATION_CREATION,
  schedule: env.notificationCreationSchedule,
  handler: async () => {
    const today = new Date(dayjs().format('MM/DD/YYYY')).toISOString();

    try {
      const notifiedImmunizations = await ImmunizationScheduleModel.findAll({
        where: {
          [Op.or]: [
            { repeatShotAt: today },
            {
              repeatShotAt: null,
              dateDue: today,
            },
          ],
        },
        include: [
          {
            model: UserModel,
            as: 'userImmunization',
            required: false,
          },
          {
            model: BabyBookModel,
            as: 'babyBookImmunization',
            required: false,
          },
        ],
      });
      const notifiedCheckUps = await CheckUpScheduleModel.findAll({
        where: {
          [Op.or]: [
            { notifyAt: today },
            {
              notifyAt: null,
              dateDue: today,
            },
          ],
        },
        include: [
          {
            model: UserModel,
            as: 'userCheckUps',
            required: false,
          },
          {
            model: BabyBookModel,
            as: 'babyBookCheckUps',
            required: false,
          },
        ],
      });

      await Promise.all([
        ...notifiedImmunizations.map(async (record) => {
          const emails = [record.userImmunization.email, ...(await getSessionEmails(record.babyBookId))];

          const whereCondition: WhereOptions<UserAttributes | UserCreation> = {
            email: {
              [Op.in]: emails,
            },
          };
          if (record.isSuggested) {
            whereCondition.immunizationsNotify = true;
          } else {
            whereCondition.customImmunizationsNotify = true;
          }

          await Promise.all([
            sendEmailNotification(whereCondition, record),
            sendPushNotification(whereCondition, record),
            sendNotification(whereCondition, record),
          ]);
        }),
        ...notifiedCheckUps.map(async (record) => {
          const emails = [record.userCheckUps.email, ...(await getSessionEmails(record.babyBookId))];

          const whereCondition: WhereOptions<UserAttributes | UserCreation> = {
            email: {
              [Op.in]: emails,
            },
          };
          if (record.isSuggested) {
            whereCondition.checkUpsNotify = true;
          } else {
            whereCondition.customCheckUpsNotify = true;
          }

          await Promise.all([
            sendEmailNotification(whereCondition, record),
            sendPushNotification(whereCondition, record),
            sendNotification(whereCondition, record),
          ]);
        }),
      ]);
    } catch (error) {
      logger.error(error);
    }
  },
};
