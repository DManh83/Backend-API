import dayjs from 'dayjs';
import { has } from 'lodash';
import { Op, WhereOptions } from 'sequelize';

import { Sex } from '../common/enum';
import { GrowthPointCreation, GrowthPointAttributes } from '../interfaces/GrowthChart';
import AgePeriodModel from '../models/AgePeriod';
import BabyBookModel from '../models/BabyBook';
import GrowthPointModel from '../models/GrowthPoint';

class GrowChartRepository {
  getPointByDate = (date: Date, babyBookId: string) =>
    GrowthPointModel.findOne({
      where: {
        babyBookId,
        date,
      },
    });

  getPercentilePointByLevel = (sex: Sex, ageMonth: number, level: string, versionYear: number) =>
    GrowthPointModel.findOne({
      where: {
        sex,
        ageMonth,
        level,
        isPercentile: true,
        versionYear,
      },
    });

  getTotalAgePeriod = () => AgePeriodModel.findAll();

  getTotalPercentileVersion = (condition: Partial<GrowthPointAttributes> = {}) =>
    GrowthPointModel.findAll({
      attributes: ['versionYear', 'isReleased'],
      group: ['versionYear', 'isReleased'],
      where: {
        isPercentile: true,
        isDeleted: false,
        ...condition,
      },
      order: [['versionYear', 'DESC']],
    });

  getAgePeriodById = (id: string) =>
    AgePeriodModel.findOne({
      where: { id },
    });

  getTotalPointByPeriod = (babyBook: BabyBookModel, searchBy: keyof GrowthPointCreation, period: AgePeriodModel) => {
    const startDate = dayjs(babyBook.birthday).add(period.minAgeMonth, 'years').valueOf();
    const endDate = dayjs(babyBook.birthday).add(period.maxAgeMonth, 'years').valueOf();

    return GrowthPointModel.findAll({
      where: {
        babyBookId: babyBook.id,
        date: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate),
        },
        [searchBy]: {
          [Op.ne]: null,
        },
        isDeleted: false,
      },
      order: [['date', 'ASC']],
    });
  };

  getBeyondPoint = async (babyBook: BabyBookModel, searchBy: keyof GrowthPointCreation) => {
    const maxAgePeriod = await AgePeriodModel.findOne({
      order: [['max_age_month', 'DESC']],
    });

    const maxDate = dayjs(babyBook.birthday).add(maxAgePeriod.maxAgeMonth, 'years').valueOf();

    return GrowthPointModel.findAll({
      where: {
        babyBookId: babyBook.id,
        date: {
          [Op.gt]: new Date(maxDate),
        },
        [searchBy]: {
          [Op.ne]: null,
        },
        isDeleted: false,
      },
      order: [['date', 'ASC']],
    });
  };

  getOutdatedPoint = async (babyBook: BabyBookModel) =>
    GrowthPointModel.findAll({
      where: {
        babyBookId: babyBook.id,
        date: {
          [Op.lt]: babyBook.birthday,
        },
        isDeleted: false,
      },
      order: [['date', 'ASC']],
    });

  getTotalPercentilePoint = (params: { sex: Sex; versionYear?: number; isReleased?: boolean }) => {
    const { sex, versionYear, isReleased } = params;
    const condition: WhereOptions<GrowthPointCreation> = { isPercentile: true, sex, isDeleted: false };

    if (versionYear) {
      condition.versionYear = Number(versionYear);
    }
    if (has(params, 'isReleased')) {
      condition.isReleased = isReleased;
    }

    return GrowthPointModel.findAll({ where: condition, order: [['age_month', 'ASC']] });
  };

  getPointByIds = (ids: string[], userId: string) =>
    GrowthPointModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        userId,
        isDeleted: false,
      },
    });

  findAgesByIds = async (ids: string[]) => AgePeriodModel.findAll({ where: { id: { [Op.in]: ids } } });

  getPointById = async (id: string) => GrowthPointModel.findOne({ where: { id } });

  findPointByDate = async (babyBookId: string, date: Date) => GrowthPointModel.findOne({ where: { babyBookId, date } });

  findPointByValue = async (babyBookIds: string[], value: number, unit?: string) => {
    const min = Math.floor(value * 100) / 100;
    const max = Math.floor(value * 100 + 1) / 100;
    const searchCond: WhereOptions<GrowthPointAttributes | GrowthPointCreation> = {
      babyBookId: {
        [Op.in]: [...babyBookIds],
      },
      [Op.or]: !unit
        ? [
            { height: { [Op.gte]: min, [Op.lt]: max } },
            { weight: { [Op.gte]: min, [Op.lt]: max } },
            { headCircumference: { [Op.gte]: min, [Op.lt]: max } },
          ]
        : unit === 'kg'
        ? [{ weight: { [Op.gte]: min, [Op.lt]: max } }]
        : [{ height: { [Op.gte]: min, [Op.lt]: max } }, { headCircumference: { [Op.gte]: min, [Op.lt]: max } }],
    };

    return GrowthPointModel.findAll({
      where: searchCond,
    });
  };
}

export default new GrowChartRepository();
