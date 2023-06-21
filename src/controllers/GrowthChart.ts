import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { has } from 'lodash';

import { SharingChangeEvent, UserRole } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ForbiddenError from '../common/errors/types/ForbiddenError';
import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import {
  AddPercentileParams,
  CreateGrowthRecordParams,
  DeleteGrowthPointParams,
  DeletePercentilesParams,
  GetGrowthPointListParams,
  GrowthPointAttributes,
  UpdateAgePeriodParams,
  UpdateGrowthPointParams,
  UpdatePercentilesParams,
} from '../interfaces/GrowthChart';
import BabyBookModel from '../models/BabyBook';
import SharingChangeModel from '../models/SharingChange';
import GeneralInformationRepository from '../repositories/GeneralInformation';
import GrowChartRepository from '../repositories/GrowthChart';
import { agePeriodSerializer, multipleGrowthPointSerializer } from '../serializers/growthChartSerializer';
import GrowthChartServices from '../services/GrowthChart';

class GrowthChartController extends GrowthChartServices {
  public createGrowthRecord = async (req: Request<{}, {}, CreateGrowthRecordParams>, res: Response) => {
    const { body: params, user } = req;

    const existedBabyBook = await BabyBookModel.findOne({ where: { id: params.babyBookId } });

    if (!existedBabyBook) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    let existedGrowthPoint = await GrowChartRepository.getPointByDate(params.date, params.babyBookId);

    await withTransaction(async (trans) => {
      if (!existedGrowthPoint) {
        existedGrowthPoint = await this.createGrowthPoint(
          {
            userId: user.id,
            ...params,
            isPercentile: false,
          },
          trans
        );
      } else {
        await this.updateGrowthPointService(existedGrowthPoint, params, trans);
      }
    });

    if (user.requestBy) {
      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: existedBabyBook.id,
        event: SharingChangeEvent.CREATE_GROWTH_POINT,
        to: {
          date: existedGrowthPoint.date,
        },
      });
    }

    response.success(res);
  };

  getListGrowthPoint = async (req: Request<{}, {}, {}, GetGrowthPointListParams>, res: Response) => {
    const params: GetGrowthPointListParams = parseFormData(req.query, ['isPercentile', 'isOutdated']);

    let points: GrowthPointAttributes[] = [];
    if (has(params, 'isPercentile')) {
      if (params.isPercentile) {
        if (has(params, 'babyBookId')) {
          const [babyBookInfo, versions] = await Promise.all([
            GeneralInformationRepository.getByBabyBookId(params.babyBookId),
            GrowChartRepository.getTotalPercentileVersion({ isReleased: true }),
          ]);

          if (!babyBookInfo.sex || !babyBookInfo.birthWeight) {
            throw new BadRequestError(messages.growthChart.notFoundBabyData);
          }

          const latestLowerYear = versions
            .sort((a, b) => b.versionYear - a.versionYear)
            .find((version) => version.versionYear <= dayjs(babyBookInfo.birthday).year());
          const latestUpperYear = versions
            .sort((a, b) => a.versionYear - b.versionYear)
            .find((version) => version.versionYear >= dayjs(babyBookInfo.birthday).year());

          points = await GrowChartRepository.getTotalPercentilePoint({
            sex: babyBookInfo.sex,
            versionYear: latestLowerYear ? latestLowerYear.versionYear : latestUpperYear.versionYear,
          });
        } else if (has(params, 'sex')) {
          points = await GrowChartRepository.getTotalPercentilePoint({ sex: params.sex, versionYear: params.versionYear });
        }
      } else {
        points = [];
      }
    } else {
      const existedBabyBook = await BabyBookModel.findOne({ where: { id: params.babyBookId } });
      if (!existedBabyBook) {
        throw new NotFoundError(messages.babyBook.notFound);
      }

      if (params.periodId) {
        if (params.periodId === 'beyond') {
          points = await GrowChartRepository.getBeyondPoint(existedBabyBook, params.searchBy);
        } else {
          const existedPeriod = await GrowChartRepository.getAgePeriodById(params.periodId);
          if (!existedPeriod) {
            throw new NotFoundError(messages.growthChart.agePeriodNotFound);
          }
          points = await GrowChartRepository.getTotalPointByPeriod(existedBabyBook, params.searchBy, existedPeriod);
        }
      }

      if (params.isOutdated) {
        points = await GrowChartRepository.getOutdatedPoint(existedBabyBook);
      }
    }

    response.success(res, multipleGrowthPointSerializer(points));
  };

  getPercentileVersion = async (req: Request, res: Response) => {
    const versions = await GrowChartRepository.getTotalPercentileVersion();
    response.success(res, versions);
  };

  getAgePeriodList = async (req: Request, res: Response) => {
    const agePeriods = await GrowChartRepository.getTotalAgePeriod();

    response.success(res, {
      list: agePeriods.map(agePeriodSerializer),
    });
  };

  updateAgePeriod = async (req: Request<{}, {}, UpdateAgePeriodParams>, res: Response) => {
    const { body: params, user } = req;

    const existedAges = await GrowChartRepository.findAgesByIds(params.ages.map((age) => age.id));

    if (existedAges.length !== params.ages.length) {
      throw new NotFoundError(messages.growthChart.agePeriodNotFound);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    await withTransaction(async (trans) => {
      await this.updateAgePeriodService(existedAges, params.ages, trans);
    });

    response.success(res);
  };

  public deleteGrowthPoint = async (req: Request<{}, {}, {}, DeleteGrowthPointParams>, res: Response) => {
    const deleteParams: DeleteGrowthPointParams = parseFormData(req.query, ['ids']);
    const { user } = req;

    const points = await GrowChartRepository.getPointByIds(deleteParams.ids, req.user.id);

    if (!points.length || points.length !== deleteParams.ids.length) {
      throw new NotFoundError(messages.growthChart.notFound);
    }

    await withTransaction(async (trans) => {
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: points[0].babyBookId,
          event: SharingChangeEvent.DELETE_GROWTH_POINT,
          to: {
            dates: points.map((p) => p.date),
          },
        });
      }
      await this.destroyGrowPoints(deleteParams.ids, trans);
    });

    response.success(res);
  };

  public updateGrowthPoint = async (req: Request<{}, {}, UpdateGrowthPointParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const { body: params, user } = req;

    const existedPoint = await GrowChartRepository.getPointById(id);

    if (!existedPoint) {
      throw new NotFoundError(messages.growthChart.notFound);
    }

    if (params.date) {
      const duplicatedPoint = await GrowChartRepository.findPointByDate(existedPoint.babyBookId, params.date);

      if (duplicatedPoint) {
        throw new BadRequestError(messages.growthChart.alreadyExists);
      }
    }

    if (existedPoint.isPercentile && user.role !== UserRole.ADMIN) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    await withTransaction(async (trans) => {
      await this.updateGrowthPointService(existedPoint, params, trans, user);
    });

    response.success(res);
  };

  public addPercentile = async (req: Request<{}, {}, AddPercentileParams>, res: Response) => {
    const { body: params, user } = req;

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    await withTransaction(async (trans) => {
      await Promise.all(
        params.points.map(async (data) => {
          const existedGrowthPoint = await GrowChartRepository.getPercentilePointByLevel(
            data.sex,
            data.ageMonth,
            data.level,
            params.versionYear
          );
          if (existedGrowthPoint) {
            return this.updateGrowthPointService(
              existedGrowthPoint,
              { ...data, versionYear: params.versionYear, isReleased: params.isReleased },
              trans
            );
          }

          return this.createGrowthPoint(
            { ...data, versionYear: params.versionYear, isReleased: params.isReleased, isPercentile: true },
            trans
          );
        })
      );
    });

    response.success(res);
  };

  public deletePercentiles = async (req: Request<{}, {}, {}, DeletePercentilesParams>, res: Response) => {
    const { query: params, user } = req;

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    await withTransaction(async (trans) => {
      await this.deletePercentilesService(params, trans);
    });

    response.success(res);
  };

  public updatePercentile = async (req: Request<{}, {}, UpdatePercentilesParams>, res: Response) => {
    const { body: params, user } = req;

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    await withTransaction(async (trans) => {
      await this.updatePercentileService(params, trans);
    });

    response.success(res);
  };
}

export default new GrowthChartController();
