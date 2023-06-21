import dayjs from 'dayjs';
import { uniq } from 'lodash';
import { Op, Transaction } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { NotificationEvent, SharingChangeEvent } from '../common/enum';
import NotFoundError from '../common/errors/types/NotFoundError';
import messages from '../common/messages';
import { SharingChangeAttributes } from '../interfaces/BabyBook';
import { updateGeneralInformationParams } from '../interfaces/GeneralInformation';
import BabyBookModel from '../models/BabyBook';
import CheckUpModel from '../models/CheckUp';
import CheckUpScheduleModel from '../models/CheckUpSchedule';
import CheckUpVersionModel from '../models/CheckUpVersion';
import GeneralInformationModel from '../models/GeneralInformation';
import GrowthPointModel from '../models/GrowthPoint';
import HealthFolderModel from '../models/HealthFolder';
import ImmunizationModel from '../models/Immunization';
import ImmunizationScheduleModel from '../models/ImmunizationSchedule';
import MilestoneAlbumModel from '../models/MilestoneAlbum';
import NoteModel from '../models/Note';
import NotificationModel from '../models/Notification';
import SharingChangeModel from '../models/SharingChange';
import SharingSessionModel from '../models/SharingSession';
import SharingSessionBabyBookModel from '../models/SharingSessionBabyBook';
import UserModel from '../models/User';
import UserCheckUpVersionModel from '../models/UserCheckUpVersion';
import UserVaccinationModel from '../models/UserVaccination';
import VaccinationModel from '../models/Vaccination';

class GeneralInformationServices {
  public createNew = async (babyBookId: string, transaction: Transaction) => {
    const existedBabyBook = await BabyBookModel.findOne({ where: { id: babyBookId } });
    if (!existedBabyBook) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const newRecord = {
      userId: existedBabyBook.userId,
      babyBookId,
      birthday: existedBabyBook.birthday,
    };

    return GeneralInformationModel.create(newRecord, { transaction });
  };

  public updateBirthdayService = async (
    information: GeneralInformationModel,
    birthday: Date,
    deleteRelatedRecord: boolean,
    user: { id: string; generalInformationNotify: boolean; requestBy?: string },
    transaction: Transaction
  ) => {
    const oldBirthday = information.birthday;
    information.birthday = birthday;
    await information.save({ transaction });

    await BabyBookModel.update({ birthday }, { where: { id: information.babyBookId }, transaction });

    if (deleteRelatedRecord) {
      await Promise.all([
        MilestoneAlbumModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        HealthFolderModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        NoteModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        VaccinationModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        ImmunizationScheduleModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        UserVaccinationModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        CheckUpVersionModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        CheckUpScheduleModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        UserCheckUpVersionModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
        GrowthPointModel.destroy({ where: { babyBookId: information.babyBookId }, transaction }),
      ]);
    } else {
      const [immunizationSchedules, checkUpSchedules] = await Promise.all([
        ImmunizationScheduleModel.findAll({
          where: {
            babyBookId: information.babyBookId,
            isSuggested: true,
            isDeleted: false,
          },
          include: [
            {
              model: ImmunizationModel,
              as: 'immunizations',
              required: false,
            },
          ],
        }),
        CheckUpScheduleModel.findAll({
          where: {
            babyBookId: information.babyBookId,
            isSuggested: true,
            isDeleted: false,
          },
          include: [
            {
              model: CheckUpModel,
              as: 'checkUp',
              required: false,
            },
          ],
        }),
      ]);

      const newImmunizationSchedules = immunizationSchedules.map(
        ({ id, userId, babyBookId, vaccinationId, isSuggested, immunizationId, immunizations }) => ({
          id,
          userId,
          babyBookId,
          vaccinationId,
          immunizationId,
          isSuggested,
          dateDue: new Date(dayjs(birthday).add(immunizations.monthOld, 'months').valueOf()),
        })
      );
      const newCheckUpsSchedules = checkUpSchedules.map(
        ({ id, userId, babyBookId, isSuggested, checkUp, checkUpVersionId, checkUpId, totalFile, isDeleted }) => ({
          id,
          userId,
          babyBookId,
          isSuggested,
          checkUpVersionId,
          checkUpId,
          totalFile,
          isDeleted,
          dateDue: new Date(dayjs(birthday).add(checkUp.monthDue, 'months').valueOf()),
        })
      );

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
              babyBookId: information.babyBookId,
            },
          },
        ],
      });

      const editors = await UserModel.findAll({
        where: {
          email: {
            [Op.in]: uniq(sessions.map((s) => s.email)),
          },
          generalInformationNotify: true,
        },
      });

      const userIds = editors.map((e) => e.id);

      if (user.generalInformationNotify) {
        userIds.push(user.id);
      }

      const notificationShapes = userIds.map((userId) => ({
        id: uuidv4(),
        userId,
        babyBookId: information.babyBookId,
        event: NotificationEvent.BABY_BOOK_BIRTHDAY_UPDATED,
        isSeen: false,
        isDeleted: false,
      }));

      await Promise.all([
        ImmunizationScheduleModel.bulkCreate(newImmunizationSchedules, {
          updateOnDuplicate: ['dateDue'],
          transaction,
        }),
        CheckUpScheduleModel.bulkCreate(newCheckUpsSchedules, {
          updateOnDuplicate: ['dateDue'],
          transaction,
        }),
        NotificationModel.bulkCreate(notificationShapes, { transaction }),
      ]);
    }

    if (user.requestBy) {
      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: information.babyBookId,
        event: deleteRelatedRecord
          ? SharingChangeEvent.UPDATE_BABY_BOOK_BIRTHDAY_WITH_DELETION
          : SharingChangeEvent.UPDATE_BABY_BOOK_BIRTHDAY_WITHOUT_DELETION,
        from: {
          birthday: oldBirthday,
        },
        to: {
          birthday: new Date(birthday),
        },
      });
    }
  };

  public update = async (
    information: GeneralInformationModel,
    newData: updateGeneralInformationParams,
    user: Express.User,
    transaction: Transaction
  ) => {
    ['birthday'].forEach((key) => {
      delete newData[key];
    });

    const changes: SharingChangeAttributes[] = [];

    for (const [key, value] of Object.entries(newData)) {
      if (value || typeof value === 'string') {
        if (
          user.requestBy &&
          (['string', 'number'].includes(typeof information[key]) || information[key] === null
            ? `${information[key]}` !== `${value || null}`
            : dayjs(information[key]).diff(value))
        ) {
          changes.push({
            id: uuidv4(),
            userId: user.id,
            email: user.requestBy,
            babyBookId: information.babyBookId,
            event: SharingChangeEvent.UPDATE_GENERAL_INFORMATION,
            from: {
              [key]: information[key] || '',
            },
            to: {
              [key]: value || '',
            },
          });
        }
        information[key] = value || null;
      }
    }

    SharingChangeModel.bulkCreate(changes);

    return information.save({ transaction });
  };
}

export default GeneralInformationServices;
