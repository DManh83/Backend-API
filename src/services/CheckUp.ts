import dayjs from 'dayjs';
import { Request } from 'express';
import { has, random } from 'lodash';
import { col, fn, Op, where } from 'sequelize';
import { Transaction } from 'sequelize/types';
import { v4 as uuidv4 } from 'uuid';

import { MulterRequest } from '../controllers/BabyBook';
import {
  CheckUpCreation,
  CheckUpFileCreation,
  CheckUpScheduleAttributes,
  CheckUpScheduleCreation,
  CheckUpVersionCreation,
  UpdateCheckUpScheduleParams,
  UpdateVersionParams,
} from '../interfaces/CheckUp';
import BabyBookModel from '../models/BabyBook';
import CheckUpModel from '../models/CheckUp';
import CheckUpFileModel from '../models/CheckUpFile';
import CheckUpScheduleModel from '../models/CheckUpSchedule';
import CheckUpVersionModel from '../models/CheckUpVersion';
import UserCheckUpVersionModel from '../models/UserCheckUpVersion';
import { versionColors } from '../common/constants';
import HealthFolderModel from '../models/HealthFolder';
import HealthDocumentModel from '../models/HealthDocument';
import { HealthDocumentCreation } from '../interfaces/Health';
import { SharingChangeAttributes } from '../interfaces/BabyBook';
import { SharingChangeEvent } from '../common/enum';
import SharingChangeModel from '../models/SharingChange';

class CheckUpServices {
  public uploadFile = async (req: Request) => {
    const { file, user } = req as MulterRequest;

    const fileShape: CheckUpFileCreation = {
      userId: user.id,
      filename: file.originalname,
      pathname: file.filename,
      isDeleted: true,
      deletedAt: new Date(dayjs().valueOf()),
      fileSize: file.size,
      translatedText: req.body?.translatedText,
    };

    return CheckUpFileModel.create(fileShape);
  };

  public createVersion = async (newData: Partial<CheckUpVersionCreation>, transaction: Transaction) => {
    if (newData.isSuggested) {
      const { mainColor, subColor } = versionColors[random(0, versionColors.length - 1)];
      newData.mainColor = mainColor;
      newData.subColor = subColor;
    }

    return CheckUpVersionModel.create(newData as CheckUpVersionCreation, { transaction });
  };

  public createCheckUp = async (newData: Partial<CheckUpCreation>, transaction: Transaction) =>
    CheckUpModel.create(newData as CheckUpCreation, { transaction });

  public createScheduledCheckUp = async (newData: Partial<CheckUpScheduleCreation>, transaction: Transaction) =>
    CheckUpScheduleModel.create(newData as CheckUpScheduleCreation, { transaction });

  public createUserVersionRelation = async (userId: string, babyBookId: string, checkUpVersionId: string, transaction: Transaction) =>
    UserCheckUpVersionModel.create(
      {
        userId,
        babyBookId,
        checkUpVersionId,
        isDeleted: false,
      },
      { transaction }
    );

  destroyUserVersionRelation = async (userId: string, checkUpVersionId: string, babyBookId: string, transaction: Transaction) =>
    UserCheckUpVersionModel.destroy({
      where: {
        userId,
        checkUpVersionId,
        babyBookId,
      },
      transaction,
    });

  createCheckUpScheduleInSuggestedVersion = async (
    version: CheckUpVersionModel,
    babyBook: BabyBookModel,
    userId: string,
    transaction: Transaction
  ) => {
    const checkUps = await CheckUpModel.findAll({
      where: {
        checkUpVersionId: version.id,
      },
    });

    const schedules: CheckUpScheduleAttributes[] = checkUps.map((checkUp) => ({
      id: uuidv4(),
      userId,
      babyBookId: babyBook.id,
      checkUpVersionId: version.id,
      checkUpId: checkUp.id,
      isSuggested: version.isSuggested,
      totalFile: 0,
      isDeleted: false,
      status: 'In Due',
      dateDue: new Date(dayjs(babyBook.birthday).add(checkUp.monthDue, 'months').valueOf()),
    }));

    return CheckUpScheduleModel.bulkCreate(schedules, { transaction });
  };

  public addFilesToFolder = async (userId: string, checkUpSchedule: CheckUpScheduleModel, fileIds: string[], transaction: Transaction) => {
    const files = await CheckUpFileModel.findAll({
      where: {
        id: { [Op.in]: fileIds },
        userId,
      },
    });

    const addingFiles = files.map((file) => ({
      id: file.id,
      userId,
      checkUpScheduleId: checkUpSchedule.id,
      checkUpVersionId: checkUpSchedule.checkUpVersionId,
      babyBookId: checkUpSchedule.babyBookId,
      filename: file.filename,
      pathname: file.pathname,
      isDeleted: false,
      fileSize: file.fileSize,
    }));

    return CheckUpFileModel.bulkCreate(addingFiles, {
      updateOnDuplicate: ['checkUpScheduleId', 'checkUpVersionId', 'babyBookId', 'isDeleted'],
      transaction,
    });
  };

  public addFilesToHealthFolder = async (files: CheckUpFileModel[], transaction: Transaction, checkUpFolder?: HealthFolderModel) => {
    if (!checkUpFolder) {
      checkUpFolder = await HealthFolderModel.create(
        {
          userId: files[0].userId,
          babyBookId: files[0].babyBookId,
          name: 'Check-up',
          totalDocument: 0,
          isDeleted: false,
          deletedAt: null,
        },
        { transaction }
      );
    }

    const creatingDocs: HealthDocumentCreation[] = files.map((file) => ({
      id: uuidv4(),
      userId: file.userId,
      healthFolderId: checkUpFolder.id,
      babyBookId: file.babyBookId,
      filename: file.filename,
      pathname: file.pathname,
      isDeleted: false,
      fileSize: file.fileSize,
      translatedText: file.translatedText,
    }));

    const totalDocument = checkUpFolder.isDeleted ? files.length : checkUpFolder.totalDocument + files.length;
    await Promise.all([
      HealthDocumentModel.bulkCreate(creatingDocs, { transaction }),
      checkUpFolder.update({ totalDocument, isDeleted: false }, { transaction }),
    ]);
  };

  updateCheckUp = async (checkUp: CheckUpModel, params: UpdateCheckUpScheduleParams, transaction: Transaction) => {
    if (has(params, 'title')) {
      checkUp.title = params.title;
    }
    if (has(params, 'ageDue')) {
      checkUp.ageDue = params.ageDue;
      checkUp.monthDue = params.monthDue;
    }

    await checkUp.save({ transaction });
  };

  updateCheckUpSchedule = async (
    schedule: CheckUpScheduleModel,
    checkUp: CheckUpModel,
    updateParams: UpdateCheckUpScheduleParams,
    user: Express.User,
    transaction: Transaction
  ) => {
    const changes: SharingChangeAttributes[] = [];

    ['dateDone', 'dateDue', 'notifyAt', 'status'].forEach((key) => {
      if (has(updateParams, key)) {
        if (
          user.requestBy &&
          (['string', 'number'].includes(typeof schedule[key]) || schedule[key] === null
            ? `${schedule[key]}` !== `${updateParams[key] || null}`
            : dayjs(schedule[key]).diff(updateParams[key]))
        ) {
          changes.push({
            id: uuidv4(),
            userId: user.id,
            email: user.requestBy,
            babyBookId: schedule.babyBookId,
            event: SharingChangeEvent.UPDATE_CHECK_UP_RECORD,
            from: {
              [key]: schedule[key] || '',
              isSuggested: schedule.isSuggested,
              title: checkUp.title || '',
              ageDue: checkUp.ageDue || '',
            },
            to: {
              [key]: updateParams[key],
            },
          });
        }
        schedule[key] = updateParams[key] || null;
      }
    });

    if (changes.length) {
      SharingChangeModel.bulkCreate(changes);
    }

    await schedule.save({ transaction });
  };

  destroyCheckUp = async (id: string, transaction: Transaction) =>
    CheckUpModel.destroy({
      where: {
        id,
      },
      transaction,
    });

  destroyScheduleOfCheckUpVersion = async (checkUpVersionId: string, userId: string, babyBookId: string, transaction: Transaction) =>
    CheckUpScheduleModel.destroy({
      where: {
        checkUpVersionId,
        userId,
        babyBookId,
      },
      transaction,
    });

  deleteCheckUpFileService = async (files: CheckUpFileModel[], force: boolean, transaction: Transaction) =>
    Promise.all(
      files.map(async (file) => {
        if (force) {
          return file.destroy({ transaction });
        }

        file.isDeleted = true;
        return file.save({ transaction });
      })
    );

  undoCheckUpFilesService = async (ids: string[], transaction: Transaction) => {
    await CheckUpFileModel.update({ isDeleted: false }, { where: { id: { [Op.in]: ids } }, transaction });
  };

  updateVersionService = async (version: CheckUpVersionModel, newData: UpdateVersionParams, transaction: Transaction) => {
    if (newData.isReleased !== version.isReleased) {
      version.isReleased = newData.isReleased;
    }

    return version.save({ transaction });
  };

  deleteVersionService = async (id: string, transaction: Transaction) => {
    await CheckUpVersionModel.destroy({
      where: {
        id,
      },
      transaction,
    });
  };
}

export default CheckUpServices;
