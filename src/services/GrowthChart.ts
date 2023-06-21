import dayjs from 'dayjs';
import { has } from 'lodash';
import { col, fn, Op, where, WhereOptions } from 'sequelize';
import { Transaction } from 'sequelize/types';
import { v4 as uuidv4 } from 'uuid';

import { SharingChangeEvent } from '../common/enum';
import { SharingChangeAttributes } from '../interfaces/BabyBook';
import {
  AgePeriodAttributes,
  DeletePercentilesParams,
  GrowthPointAttributes,
  GrowthPointCreation,
  UpdatePercentilesParams,
} from '../interfaces/GrowthChart';
import AgePeriodModel from '../models/AgePeriod';
import GrowthPointModel from '../models/GrowthPoint';
import SharingChangeModel from '../models/SharingChange';

class GrowthChartServices {
  public createGrowthPoint = async (newData: Partial<GrowthPointCreation>, transaction: Transaction) => {
    const growthPoint = await GrowthPointModel.create(newData as GrowthPointCreation, { transaction });
    return growthPoint;
  };

  updateGrowthPointService = async (
    point: GrowthPointModel,
    data: Partial<GrowthPointCreation>,
    transaction: Transaction,
    user?: Express.User
  ) => {
    const changes: SharingChangeAttributes[] = [];

    ['headCircumference', 'weight', 'height', 'date'].forEach((key) => {
      if (data[key]) {
        if (
          user?.requestBy &&
          (['string', 'number'].includes(typeof point[key]) || point[key] === null
            ? `${point[key]}` !== `${data[key] || null}`
            : dayjs(point[key]).diff(data[key]))
        ) {
          changes.push({
            id: uuidv4(),
            userId: user.id,
            email: user.requestBy,
            babyBookId: point.babyBookId,
            event: SharingChangeEvent.UPDATE_GROWTH_POINT,
            from: {
              [key]: point[key],
              date: point.date,
            },
            to: {
              [key]: data[key],
            },
          });
        }

        point[key] = data[key];
      }
    });

    if (changes.length) {
      SharingChangeModel.bulkCreate(changes);
    }

    await point.save({ transaction });
  };

  destroyGrowPoints = async (ids: string[], transaction: Transaction) =>
    GrowthPointModel.destroy({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });

  updateAgePeriodService = async (agePeriods: AgePeriodModel[], values: Partial<AgePeriodAttributes>[], transaction: Transaction) =>
    Promise.all(
      agePeriods.map(async (period) => {
        const newData = values.find((value) => value.id === period.id);

        period.text = newData.text;
        period.minAgeMonth = newData.minAgeMonth;
        period.maxAgeMonth = newData.maxAgeMonth;

        return period.save({ transaction });
      })
    );

  deletePercentilesService = async ({ versionYear, level, month }: DeletePercentilesParams, transaction: Transaction) => {
    const cond: WhereOptions<GrowthPointAttributes> = {
      versionYear,
      isPercentile: true,
    };

    if (level) {
      cond.level = where(fn('LOWER', col('level')), 'LIKE', level.trim().toLowerCase());
    }

    if (month) {
      cond.ageMonth = Number(month);
    }

    await GrowthPointModel.destroy({
      where: cond,
      transaction,
    });
  };

  updatePercentileService = async (params: UpdatePercentilesParams, transaction: Transaction) => {
    const newState: Partial<GrowthPointCreation> = {};

    if (has(params, 'isReleased')) {
      newState.isReleased = params.isReleased;
    }

    await GrowthPointModel.update(newState, {
      where: {
        versionYear: params.versionYear,
        isPercentile: true,
      },
      transaction,
    });
  };
}

export default GrowthChartServices;
