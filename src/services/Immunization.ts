import dayjs from 'dayjs';
import { Transaction } from 'sequelize/types';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { random } from 'lodash';

import {
  AntigenCreation,
  ImmunizationCreation,
  ImmunizationScheduleAttributes,
  ImmunizationScheduleCreation,
  UpdateImmunizationScheduleParams,
  UpdateVaccinationParams,
  VaccinationCreation,
} from '../interfaces/Immunization';
import BabyBookModel from '../models/BabyBook';
import ImmunizationModel from '../models/Immunization';
import ImmunizationScheduleModel from '../models/ImmunizationSchedule';
import UserVaccinationModel from '../models/UserVaccination';
import VaccinationModel from '../models/Vaccination';
import AntigenModel from '../models/Antigen';
import ImmunizationAntigenModel from '../models/ImmunizationAntigen';
import { versionColors } from '../common/constants';
import { SharingChangeAttributes } from '../interfaces/BabyBook';
import { SharingChangeEvent } from '../common/enum';
import SharingChangeModel from '../models/SharingChange';

class ImmunizationServices {
  public createVaccination = async (newData: Partial<VaccinationCreation>, transaction: Transaction) => {
    if (newData.isSuggested) {
      const { mainColor, subColor } = versionColors[random(0, versionColors.length - 1)];
      newData.mainColor = mainColor;
      newData.subColor = subColor;
    }

    return VaccinationModel.create(newData as VaccinationCreation, { transaction });
  };

  public createImmunization = async (newData: Partial<ImmunizationCreation>, transaction: Transaction) =>
    ImmunizationModel.create(newData as ImmunizationCreation, { transaction });

  public createImmunizationSuggested = async (newData: Partial<ImmunizationCreation>, antigenIds: string[], transaction: Transaction) => {
    if (antigenIds.length) {
      await Promise.all(
        antigenIds.map(async (antigenId) => {
          const data = {
            ...newData,
            antigenId,
          };
          const immunization = await ImmunizationModel.create(data as ImmunizationCreation, { transaction });

          const newRecord = {
            immunizationId: immunization.id,
            antigenId,
            isDeleted: false,
            id: uuidv4(),
          };

          await ImmunizationAntigenModel.create(newRecord, { transaction });
        })
      );
    }
  };

  public createScheduledImmunization = async (newData: Partial<ImmunizationScheduleCreation>, transaction: Transaction) =>
    ImmunizationScheduleModel.create(newData as ImmunizationScheduleCreation, { transaction });

  public createUserVaccinationRelation = async (userId: string, babyBookId: string, vaccinationId: string, transaction: Transaction) =>
    UserVaccinationModel.create(
      {
        userId,
        babyBookId,
        vaccinationId,
        isDeleted: false,
      },
      { transaction }
    );

  destroyUserVaccinationRelation = async (userId: string, vaccinationId: string, babyBookId: string, transaction: Transaction) =>
    UserVaccinationModel.destroy({
      where: {
        userId,
        vaccinationId,
        babyBookId,
      },
      transaction,
    });

  createImmunizationScheduleInVaccination = async (
    vaccination: VaccinationModel,
    babyBook: BabyBookModel,
    userId: string,
    transaction: Transaction
  ) => {
    const immunizations = await ImmunizationModel.findAll({
      where: {
        vaccinationId: vaccination.id,
      },
    });

    const babyBirthday = new Date(babyBook.birthday);

    const schedules: ImmunizationScheduleAttributes[] = immunizations.map((immunization) => {
      const dateDue = new Date(dayjs(babyBirthday).add(immunization.monthOld, 'months').valueOf());

      return {
        id: uuidv4(),
        userId,
        babyBookId: babyBook.id,
        vaccinationId: vaccination.id,
        immunizationId: immunization.id,
        dateDue,
        isSuggested: vaccination.isSuggested,
      };
    });

    return ImmunizationScheduleModel.bulkCreate(schedules, { transaction });
  };

  public createScheduleWhenSuggestedImmunizationUpdated = async (
    vaccinationId: string,
    babyBookId: string,
    immunizationId: string,
    userId: string,
    transaction: Transaction
  ) => {
    const [babyBook, immunization, vaccination] = await Promise.all([
      BabyBookModel.findOne({
        where: {
          id: babyBookId,
        },
      }),
      ImmunizationModel.findOne({
        where: {
          id: immunizationId,
        },
      }),
      VaccinationModel.findOne({
        where: {
          id: vaccinationId,
        },
      }),
    ]);

    const babyBirthday = new Date(babyBook.birthday);
    const dateDue = new Date(dayjs(babyBirthday).add(immunization.monthOld, 'months').valueOf());

    const schedule: ImmunizationScheduleAttributes = {
      id: uuidv4(),
      userId,
      babyBookId: babyBook.id,
      vaccinationId,
      immunizationId,
      dateDue,
      isSuggested: vaccination.isSuggested,
    };

    return ImmunizationScheduleModel.create(schedule, { transaction });
  };

  createAntigens = async (names: string[], userId: string | null, transaction: Transaction) => {
    const existedRecords = await AntigenModel.findAll({
      where: {
        name: {
          [Op.in]: names,
        },
      },
    });

    return Promise.all(
      names.map(async (name) => {
        let existedAntigen = existedRecords.find((record) => record.name === name);
        if (!existedAntigen) {
          existedAntigen = await AntigenModel.create(
            {
              userId,
              name,
            },
            { transaction }
          );
        }

        return existedAntigen.id;
      })
    );
  };

  updateImmunizationAntigen = async (antigenIds: string[], immunizationId: string, transaction: Transaction) => {
    const existedRecords = await ImmunizationAntigenModel.findAll({
      where: {
        immunizationId,
      },
    });

    const newRecords = antigenIds
      .filter((id) => !existedRecords.find((record) => record.antigenId === id))
      .map((id) => ({
        immunizationId,
        antigenId: id,
        isDeleted: false,
        id: uuidv4(),
      }));
    const removedRecords = existedRecords.filter((record) => !antigenIds.find((id) => record.antigenId === id)).map((record) => record.id);

    await Promise.all([
      ImmunizationAntigenModel.bulkCreate(newRecords, { transaction }),
      ImmunizationAntigenModel.destroy({ where: { id: { [Op.in]: removedRecords } }, transaction }),
    ]);
  };

  addImmunizationAntigen = async (antigenIds: string[], immunizationId: string, transaction: Transaction) => {
    const existedRecords = await ImmunizationAntigenModel.findAll({
      where: {
        immunizationId,
      },
    });

    const newRecords = antigenIds
      .filter((id) => !existedRecords.find((record) => record.antigenId === id))
      .map((id) => ({
        immunizationId,
        antigenId: id,
        isDeleted: false,
        id: uuidv4(),
      }));

    await ImmunizationAntigenModel.bulkCreate(newRecords, { transaction });
  };

  updateImmunizationSchedule = async (
    schedule: ImmunizationScheduleModel,
    updateParams: UpdateImmunizationScheduleParams,
    user: Express.User,
    transaction: Transaction
  ) => {
    const changes: SharingChangeAttributes[] = [];
    const updateFields = ['batchNo', 'status', 'organization'];

    if (schedule.isSuggested) {
      updateFields.push('dateDone');
    } else {
      updateFields.push('dateDue', 'repeatShotAt');
    }

    updateFields.forEach((key) => {
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
          event: SharingChangeEvent.UPDATE_SCHEDULE_IMMUNIZATION,
          from: {
            [key]: schedule[key] || '',
            isSuggested: schedule.isSuggested,
            dateDue: schedule.dateDue || null,
          },
          to: {
            [key]: updateParams[key],
          },
        });
      }
      schedule[key] = updateParams[key] || null;
    });

    if (changes.length) {
      SharingChangeModel.bulkCreate(changes);
    }
    await schedule.save({ transaction });
  };

  updateVaccinationService = async (vaccination: VaccinationModel, newData: UpdateVaccinationParams, transaction: Transaction) => {
    if (newData.isReleased !== vaccination.isReleased) {
      vaccination.isReleased = newData.isReleased;
    }

    if (newData.tooltip || newData.tooltip === '') {
      vaccination.tooltip = newData.tooltip;
    }

    return vaccination.save({ transaction });
  };

  destroyImmunizationSuggested = async (immunizationIds: string[], transaction: Transaction) =>
    ImmunizationModel.destroy({
      where: {
        id: {
          [Op.in]: immunizationIds,
        },
      },
      transaction,
    });

  destroyImmunization = async (immunizationId: string, transaction: Transaction) =>
    ImmunizationModel.destroy({
      where: {
        id: immunizationId,
      },
      transaction,
    });

  destroyVaccination = async (vaccination: VaccinationModel, transaction: Transaction) => vaccination.destroy({ transaction });

  resetImmunizationSchedule = async (schedule: ImmunizationScheduleModel, transaction: Transaction) => {
    schedule.batchNo = null;
    schedule.status = null;
    schedule.organization = null;
    schedule.dateDone = null;
    schedule.isCompleted = false;

    return schedule.save({ transaction });
  };

  destroyScheduleOfVaccination = async (vaccinationId: string, userId: string, babyBookId: string, transaction: Transaction) =>
    ImmunizationScheduleModel.destroy({
      where: {
        vaccinationId,
        userId,
        babyBookId,
      },
      transaction,
    });

  destroyImmunizationOfVaccination = async (vaccinationId: string, userId: string, transaction: Transaction) =>
    ImmunizationScheduleModel.destroy({
      where: {
        vaccinationId,
        userId,
      },
      transaction,
    });

  updateAntigenService = async (antigen: AntigenModel, data: Partial<AntigenCreation>, transaction: Transaction) => {
    if (data.name) {
      antigen.name = data.name;
    }
    return antigen.save({ transaction });
  };

  destroyAntigenService = async (antigen: AntigenModel, transaction: Transaction) => antigen.destroy({ transaction });
}

export default ImmunizationServices;
